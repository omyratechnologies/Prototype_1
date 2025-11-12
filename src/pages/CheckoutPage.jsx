import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/EnhancedCartContext';
import { LoadingSpinner, ErrorMessage } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function CheckoutPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cart,
    loading,
    error,
    businessCalculation,
    invoice,
    isReserved,
    isReservationExpired,
    reservationSecondsRemaining,
    reservationMinutes,
    cancelCheckout,
    getCartSummary,
    getItemCount
  } = useCart();

  const autoOpenInvoice = Boolean(location.state?.autoOpenInvoice);
  const orderIdFromLocation = location.state?.orderId || null;
  const currentPath = location.pathname;
  const [hasAutoOpenedInvoice, setHasAutoOpenedInvoice] = useState(false);
  const [recentOrderId, setRecentOrderId] = useState(() => orderIdFromLocation);

  const cartItems = cart?.items || [];
  const calculationItems = businessCalculation?.items || [];
  const enrichedItems = cartItems.map((item, index) => {
    const calcItem = calculationItems[index] || {};
    const variant = item.variantTypeId || {};

    return {
      id: item._id || variant._id || item.variantTypeId || index,
      name: variant.name || calcItem.product?.name || 'Product',
      image: variant.images?.[0],
      category: variant.category || calcItem.product?.category,
      quantity: calcItem.totalPieces ?? item.quantity ?? 0,
      crateQty: calcItem.crateQty ?? item.metadata?.crateQty ?? 0,
      pieceQty: calcItem.pieceQty ?? item.metadata?.pieceQty ?? 0,
      fillerPieces: calcItem.fillerPieces ?? item.metadata?.fillerPieces ?? 0,
      unitPrice: calcItem.unitPrice ?? item.unitPrice ?? 0,
      fillerCharges: calcItem.fillerCharges ?? item.metadata?.fillerCharges ?? 0,
      lineTotal: calcItem.itemSubtotal ?? item.finalPrice ?? 0,
      weight: calcItem.weight ?? item.metadata?.weight ?? 0,
      piecesPerCrate: item.metadata?.piecesPerCrate ?? 0
    };
  });
  const computedItemCount = typeof getItemCount === 'function' ? getItemCount() : cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartTotal = businessCalculation?.finalTotal ?? cart?.total ?? 0;

  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [hasAutoReleased, setHasAutoReleased] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Cart is automatically loaded by CartContext when user is available
    // No need to call loadCart() here to avoid duplicate requests
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    if (invoice) return;
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) return;
    getCartSummary();
  }, [user, cart, invoice, getCartSummary]);

  useEffect(() => {
    if (orderIdFromLocation) {
      setRecentOrderId(orderIdFromLocation);
    }
  }, [orderIdFromLocation]);

  useEffect(() => {
    if (!isReserved) {
      setHasAutoReleased(false);
      return;
    }

    if (reservationSecondsRemaining > 0 || hasAutoReleased) {
      return;
    }

    const releaseReservation = async () => {
      try {
        await cancelCheckout();
        alert('Your reservation window expired. Inventory has been released and you\'re being redirected to the cart.');
        navigate('/cart');
      } catch (error) {
        console.error('Error canceling checkout after expiry:', error);
      } finally {
        setHasAutoReleased(true);
      }
    };

    releaseReservation();
  }, [isReserved, reservationSecondsRemaining, hasAutoReleased, cancelCheckout, navigate]);

  const formatCurrency = (amount, currencySymbol = '₹') => {
    const numericValue = Number(amount) || 0;
    return `${currencySymbol}${numericValue.toLocaleString()}`;
  };

  const formatWeight = (weight) => {
    const numericValue = Number(weight) || 0;
    return `${numericValue.toLocaleString()} lbs`;
  };

  const formatReservationCountdown = () => {
    if (!isReserved || reservationSecondsRemaining <= 0) {
      return '00:00';
    }
    const minutes = Math.floor(reservationSecondsRemaining / 60);
    const seconds = reservationSecondsRemaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatDateTime = (value) => {
    if (!value) return null;
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const getPrintableInvoiceHtml = (invoiceData, calculationData) => {
    if (!invoiceData) {
      return '<html><body><h1>Invoice unavailable</h1></body></html>';
    }

    const currency = invoiceData.currency || 'INR';
    const formatAmount = (value) => {
      const numeric = Number(value) || 0;
      return `${currency} ${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const issueDate = invoiceData.issueDate ? new Date(invoiceData.issueDate) : null;
    const dueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate) : null;

    const reservationNotice = invoiceData.reservation?.terms || '';

    const lineItemsHtml = (invoiceData.lineItems || [])
      .map(item => {
        const { crateQty, pieceQty, totalPieces, fillerPieces } = item.quantities || {};
        const pricing = item.pricing || {};
        const weight = item.weight || {};

        return `
          <tr>
            <td>${item.productName || 'Product'}</td>
            <td>${crateQty ?? 0}</td>
            <td>${pieceQty ?? 0}</td>
            <td>${totalPieces ?? 0}</td>
            <td>${fillerPieces ?? 0}</td>
            <td>${formatAmount(pricing.unitPrice)}</td>
            <td>${formatAmount(pricing.fillerCharges)}</td>
            <td>${weight?.totalWeight ?? 0} ${weight?.unit || 'lbs'}</td>
            <td>${formatAmount(pricing.lineTotal)}</td>
          </tr>
        `;
      })
      .join('');

    const totals = invoiceData.totals || {};
    const logistics = invoiceData.logistics || {};
    const buyer = invoiceData.buyer || {};
    const seller = invoiceData.seller || {};

    const normalizedBuyer = {
      name: buyer.name || user?.name || 'Valued Customer',
      company: buyer.company || '',
      email: buyer.email || user?.email || '',
      phone: buyer.phone || user?.phone || '',
      address: buyer.address || '',
      city: buyer.city || '',
      state: buyer.state || '',
      postalCode: buyer.postalCode || buyer.pincode || '',
    };

    const formattedLocation = [normalizedBuyer.city, normalizedBuyer.state].filter(Boolean).join(', ');

    const shippingDetails = `
      <p><strong>Ship To:</strong><br />
        ${normalizedBuyer.name}<br />
        ${normalizedBuyer.address || '—'}<br />
        ${formattedLocation} ${normalizedBuyer.postalCode || ''}<br />
        ${normalizedBuyer.phone || '—'}<br />
        ${normalizedBuyer.email || ''}
      </p>
    `;

    const html = `
      <html>
        <head>
          <title>Pro Forma Invoice ${invoiceData.invoiceNumber || ''}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #111827; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f3f4f6; }
            .section { margin-top: 24px; }
            .columns { display: flex; gap: 40px; }
            .column { flex: 1; }
            .totals { width: 320px; margin-left: auto; }
            .totals tr:first-child th, .totals tr:first-child td { border-top: none; }
            .totals th { text-align: left; }
            .totals td { text-align: right; }
            .notes { font-size: 12px; color: #4b5563; }
            .badge { display: inline-block; padding: 4px 8px; background-color: #111827; color: white; border-radius: 9999px; font-size: 12px; }
            .meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 14px; color: #4b5563; }
            .header { display: flex; justify-content: space-between; align-items: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Pro Forma Invoice</h1>
              <div class="meta">
                <span><strong>Invoice #:</strong> ${invoiceData.invoiceNumber || '-'}</span>
                <span><strong>Issued:</strong> ${issueDate ? issueDate.toLocaleString('en-IN') : '-'}</span>
              </div>
              <div class="meta">
                <span><strong>Due:</strong> ${dueDate ? dueDate.toLocaleString('en-IN') : '-'}</span>
                <span><strong>Total Due:</strong> ${formatAmount(totals.totalDue)}</span>
              </div>
            </div>
            <div>
              <span class="badge">${invoiceData.type === 'pro-forma' ? 'Pro Forma' : 'Invoice'}</span>
            </div>
          </div>

          <div class="columns section">
            <div class="column">
              <h2>Seller</h2>
              <p>
                <strong>${seller.company || seller.name || 'RR Stones'}</strong><br />
                ${seller.address || ''}<br />
                Email: ${seller.email || ''}<br />
                Phone: ${seller.phone || ''}<br />
                GST / Tax ID: ${seller.taxId || 'N/A'}
              </p>
            </div>
            <div class="column">
              <h2>Buyer</h2>
              <p>
                <strong>${buyer.name || 'Valued Customer'}</strong><br />
                ${buyer.company || ''}<br />
                Email: ${buyer.email || ''}<br />
                Phone: ${buyer.phone || ''}<br />
                Customer Code: ${buyer.customerCode || 'N/A'}
              </p>
            </div>
            <div class="column">
              <h2>Delivery</h2>
              ${shippingDetails}
            </div>
          </div>

          <h2>Line Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Crates</th>
                <th>Pieces</th>
                <th>Total Pieces</th>
                <th>Filler Pieces</th>
                <th>Unit Price</th>
                <th>Filler Charges</th>
                <th>Weight</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
          </table>

          <div class="section" style="display:flex; gap:40px; align-items:flex-start; flex-wrap:wrap;">
            <div style="flex:1; min-width:240px;">
              <h2>Logistics</h2>
              <p><strong>Total Weight:</strong> ${logistics.totalWeight || calculationData?.totalWeight || 0} ${logistics.weightUnit || 'lbs'}</p>
              ${logistics.weightWarning ? `<p><strong>Note:</strong> ${logistics.weightWarning}</p>` : ''}
              <p><strong>Reservation:</strong> ${reservationNotice}</p>
            </div>
            <table class="totals" style="flex:1; min-width:260px;">
              <tbody>
                <tr><th>Subtotal</th><td>${formatAmount(totals.subtotal)}</td></tr>
                <tr><th>Discount (${totals.discountPercent || 0}%)</th><td>- ${formatAmount(totals.discountAmount)}</td></tr>
                <tr><th>Filler Charges</th><td>${formatAmount(totals.fillerCharges)}</td></tr>
                <tr><th>Shipping</th><td>${formatAmount(totals.shippingFee)}</td></tr>
                <tr><th>Total Due</th><td><strong>${formatAmount(totals.totalDue)}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div class="section notes">
            <h2>Notes</h2>
            <ul>
              ${(invoiceData.notes || []).map(note => `<li>${note}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const handleGenerateInvoice = useCallback(async () => {
    try {
      setIsGeneratingInvoice(true);

      let latestInvoice = invoice;
      if (!latestInvoice) {
        const summary = await getCartSummary();
        latestInvoice = summary?.invoice || null;
      }

      if (!latestInvoice) {
        alert('Invoice data is not ready yet. Please try again in a moment.');
        return;
      }

      const invoiceHtml = getPrintableInvoiceHtml(latestInvoice, businessCalculation);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.srcdoc = invoiceHtml;

      const cleanup = () => {
        iframe.parentNode?.removeChild(iframe);
      };

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printError) {
          console.error('Invoice print error:', printError);
          alert('Unable to open the invoice for printing. Please try again.');
        } finally {
          cleanup();
        }
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert(error.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  }, [invoice, businessCalculation, getCartSummary]);

  useEffect(() => {
    if (hasAutoOpenedInvoice) return;
    if (!invoice) return;
    if (!autoOpenInvoice) return;

    handleGenerateInvoice();
    setHasAutoOpenedInvoice(true);

    const stateToPreserve = recentOrderId ? { orderId: recentOrderId } : {};
    navigate(currentPath, { replace: true, state: stateToPreserve });
  }, [autoOpenInvoice, hasAutoOpenedInvoice, invoice, handleGenerateInvoice, navigate, currentPath, recentOrderId]);

  const handleCancelCheckout = async () => {
    if (window.confirm('Are you sure you want to cancel checkout? Items will be released from reservation.')) {
      try {
        await cancelCheckout();
        setHasAutoReleased(true);
        navigate('/cart');
      } catch (error) {
        console.error('Error canceling checkout:', error);
        alert(error.message || 'Failed to cancel checkout');
      }
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-white min-h-screen">
      <NavBar user={user} onLogout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            {isReserved && (
              <p className="text-sm text-gray-600 mt-1">
                Reservation time remaining: <span className="font-semibold text-gray-900">{formatReservationCountdown()}</span>
                {reservationMinutes ? ` of ${reservationMinutes} minutes` : ''}.
              </p>
            )}
            {isReservationExpired && (
              <p className="text-sm text-orange-600 mt-1">
                Your reservation has expired. Cancel to refresh the cart and re-reserve inventory.
              </p>
            )}
          </div>
          {isReserved && (
            <button
              onClick={handleCancelCheckout}
              className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              Cancel Checkout
            </button>
          )}
        </div>

          {recentOrderId && (
            <div className="mb-6 border border-green-200 bg-green-50 text-green-900 rounded-lg px-4 py-3 text-sm">
              <p className="font-semibold">Checkout complete</p>
              <p className="mt-1 text-green-800">
                Order ID: <span className="font-medium">{recentOrderId}</span>. A printable invoice should be open in a new tab.
                If your browser blocked the pop-up, use the button below to open it again.
              </p>
            </div>
          )}

        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <ErrorMessage error={error} onRetry={getCartSummary} />
        )}

        {!loading && cartItems.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No items in cart</h2>
            <p className="text-gray-600 mb-6">Add some items to proceed with checkout.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border rounded-lg p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Overview</h2>
                  {invoice ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="font-medium text-gray-900">Invoice Number</p>
                        <p>{invoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Issued</p>
                        <p>{formatDateTime(invoice.issueDate) || '—'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Due</p>
                        <p>{formatDateTime(invoice.dueDate) || '—'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Reservation Valid Until</p>
                        <p>{formatDateTime(invoice.reservation?.reservedUntil) || '—'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Invoice data is loading…</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer</h3>
                  {invoice ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><span className="font-medium text-gray-900">Name:</span> {invoice.buyer?.name || user?.name || 'Valued Customer'}</p>
                      {invoice.buyer?.company && <p><span className="font-medium text-gray-900">Company:</span> {invoice.buyer.company}</p>}
                      <p><span className="font-medium text-gray-900">Email:</span> {invoice.buyer?.email || user?.email || '—'}</p>
                      <p><span className="font-medium text-gray-900">Phone:</span> {invoice.buyer?.phone || '—'}</p>
                      {invoice.buyer?.address && (
                        <p><span className="font-medium text-gray-900">Address:</span> {invoice.buyer.address}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Customer details will appear once the invoice is ready.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  {invoice?.notes?.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {invoice.notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Standard pro forma terms apply.</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={isGeneratingInvoice || loading || !invoice}
                    className="sm:w-auto w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGeneratingInvoice ? 'Preparing Invoice…' : 'Open Printable Invoice'}
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="sm:w-auto w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {enrichedItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Crates: {item.crateQty} • Pieces: {item.pieceQty} • Total pcs: {item.quantity}
                        </p>
                        {item.fillerPieces > 0 && (
                          <p className="text-xs text-orange-600">Filler pieces: {item.fillerPieces} ({formatCurrency(item.fillerCharges)})</p>
                        )}
                        <p className="text-xs text-gray-500">Weight: {formatWeight(item.weight)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.lineTotal)}</p>
                        <p className="text-xs text-gray-500">Unit {formatCurrency(item.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 mb-6 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items subtotal ({computedItemCount} pcs)</span>
                    <span className="text-gray-900">{formatCurrency(businessCalculation?.subtotal ?? cartTotal)}</span>
                  </div>
                  {businessCalculation?.discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Tier discount ({businessCalculation.discountPercent}%)</span>
                      <span>-{formatCurrency(businessCalculation.discountAmount)}</span>
                    </div>
                  )}
                  {businessCalculation?.totalFillerCharges > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Filler charges</span>
                      <span>{formatCurrency(businessCalculation.totalFillerCharges)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {businessCalculation
                        ? (businessCalculation.shippingFee > 0
                          ? formatCurrency(businessCalculation.shippingFee)
                          : 'Included')
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total weight</span>
                    <span>{formatWeight(businessCalculation?.totalWeight)}</span>
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total payable</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateInvoice}
                  disabled={isGeneratingInvoice || loading || enrichedItems.length === 0 || !invoice}
                  className="w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingInvoice ? 'Preparing Invoice…' : 'Print / Download Invoice'}
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
                  <p>🕒 Inventory remains reserved while you keep this invoice active.</p>
                  {isReserved && (
                    <p>
                      Time remaining: <span className="font-medium text-gray-700">{formatReservationCountdown()}</span>
                      {reservationMinutes ? ` of ${reservationMinutes} minutes` : ''}.
                    </p>
                  )}
                  {invoice?.notes?.[0] && (
                    <p className="text-[11px] leading-relaxed text-gray-500">{invoice.notes[0]}</p>
                  )}
                </div>

                {invoice && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-1 text-xs text-gray-600 text-left">
                    <p className="text-sm font-semibold text-gray-900">Pro Forma Invoice #{invoice.invoiceNumber}</p>
                    <p>Issued: {formatDateTime(invoice.issueDate)}</p>
                    <p>Due: {formatDateTime(invoice.dueDate)}</p>
                    {invoice.reservation?.reservedUntil && (
                      <p>Reservation valid through {formatDateTime(invoice.reservation.reservedUntil)}</p>
                    )}
                    <p>Total due: <span className="font-semibold text-gray-900">{formatCurrency(invoice.totals?.totalDue)}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}