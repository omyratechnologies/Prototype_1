import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, ErrorMessage } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function InvoicePage() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get invoice data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    
    if (invoiceId) {
      loadInvoice(invoiceId);
    } else {
      // Generate a new invoice from cart/order data
      generateInvoiceFromOrder();
    }
  }, []);

  const loadInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock invoice loading - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoice = generateMockInvoice(invoiceId);
      setInvoice(mockInvoice);
    } catch (err) {
      console.error('Error loading invoice:', err);
      setError(err.message || 'Failed to load invoice');
      showError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceFromOrder = () => {
    try {
      const mockInvoice = generateMockInvoice();
      setInvoice(mockInvoice);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const generateMockInvoice = (invoiceId = null) => {
    const id = invoiceId || `INV-${Date.now()}`;
    const today = new Date();
    
    return {
      id,
      number: `RRS-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${id.split('-')[1] || '001'}`,
      date: today.toISOString().split('T')[0],
      dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      
      company: {
        name: 'RR STONES',
        address: '123 Business Park, Granite Street',
        city: 'Mumbai, Maharashtra 400001',
        phone: '+91 9876543210',
        email: 'info@rrstones.com',
        gst: 'GST123456789',
        pan: 'PAN123456'
      },
      
      customer: {
        name: user?.name || 'Customer',
        email: user?.email || 'customer@example.com',
        phone: user?.phone || '+91 9876543210',
        address: user?.address?.street || '456 Customer Address',
        city: `${user?.address?.city || 'Delhi'}, ${user?.address?.state || 'Delhi'} ${user?.address?.pincode || '110001'}`,
        gst: user?.gst || ''
      },
      
      items: [
        {
          id: 1,
          name: 'Blue Mist Granite Slabs',
          description: 'Premium quality granite slabs with polished finish',
          quantity: 2,
          unit: 'sq ft',
          rate: 1500,
          amount: 3000,
          hsn: '68029390'
        },
        {
          id: 2,
          name: 'Royal Grey Granite Steps',
          description: 'Durable granite steps with anti-slip surface',
          quantity: 5,
          unit: 'pcs',
          rate: 2500,
          amount: 12500,
          hsn: '68029390'
        },
        {
          id: 3,
          name: 'Installation & Delivery',
          description: 'Professional installation and delivery service',
          quantity: 1,
          unit: 'service',
          rate: 5000,
          amount: 5000,
          hsn: '99950000'
        }
      ],
      
      subtotal: 20500,
      taxRate: 18,
      taxAmount: 3690,
      total: 24190,
      
      terms: [
        'Payment is due within 30 days of invoice date',
        'Late payments may incur additional charges',
        'All materials remain property of RR Stones until payment is received in full',
        'Installation warranty: 1 year from completion date',
        'Material warranty: 5 years for manufacturing defects'
      ],
      
      bankDetails: {
        accountName: 'RR STONES PRIVATE LIMITED',
        accountNumber: '1234567890',
        bankName: 'State Bank of India',
        branch: 'Business Park Branch',
        ifsc: 'SBIN0001234',
        upi: 'rrstones@paytm'
      }
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    success('Invoice download started. Check your downloads folder.');
    // In real app, this would generate and download a PDF
  };

  const handleSendEmail = () => {
    success('Invoice sent to your email address.');
    // In real app, this would send email via API
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
            <p className="text-gray-600">The requested invoice could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="print:hidden">
        <NavBar user={user} onLogout={logout} />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Invoice Actions */}
        <div className="print:hidden mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Send Email
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none">
          <div className="p-8 print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{invoice.company.name}</h1>
                <div className="mt-2 text-gray-600">
                  <p>{invoice.company.address}</p>
                  <p>{invoice.company.city}</p>
                  <p>Phone: {invoice.company.phone}</p>
                  <p>Email: {invoice.company.email}</p>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <div className="mt-2 text-gray-600">
                  <p><span className="font-medium">Invoice #:</span> {invoice.number}</p>
                  <p><span className="font-medium">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer & Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{invoice.customer.name}</p>
                  <p>{invoice.customer.address}</p>
                  <p>{invoice.customer.city}</p>
                  <p>Phone: {invoice.customer.phone}</p>
                  <p>Email: {invoice.customer.email}</p>
                  {invoice.customer.gst && <p>GST: {invoice.customer.gst}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Details:</h3>
                <div className="text-gray-700">
                  <p>GST: {invoice.company.gst}</p>
                  <p>PAN: {invoice.company.pan}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">HSN</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Unit</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Rate</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.hsn}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.unit}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">₹{item.rate.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-72">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({invoice.taxRate}%):</span>
                    <span className="font-medium">₹{invoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold">₹{invoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information:</h3>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-medium">Account Name:</span> {invoice.bankDetails.accountName}</p>
                  <p><span className="font-medium">Account Number:</span> {invoice.bankDetails.accountNumber}</p>
                  <p><span className="font-medium">Bank:</span> {invoice.bankDetails.bankName}</p>
                  <p><span className="font-medium">Branch:</span> {invoice.bankDetails.branch}</p>
                  <p><span className="font-medium">IFSC:</span> {invoice.bankDetails.ifsc}</p>
                  <p><span className="font-medium">UPI:</span> {invoice.bankDetails.upi}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {invoice.terms.map((term, index) => (
                    <li key={index}>• {term}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end pt-8 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Customer Signature</p>
                <div className="mt-8 w-48 border-b border-gray-300"></div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">For RR STONES</p>
                <div className="mt-8 w-48 border-b border-gray-300"></div>
                <p className="text-sm text-gray-600 mt-2">Authorized Signatory</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
              <p>Thank you for your business!</p>
              <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}