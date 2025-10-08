import React from "react";
import Button from "./Button";

const HeroSection = () => (
  <section className="text-left px-12 py-18 max-w-4xl mb-20 mt-20">
    <h1 className="text-7xl font-bold leading-tight">
      WELCOME TO <br />
      <span className="block">RR STONES PVT LTD.</span>
    </h1>
    <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">
      "HALLMARK OF CLASSIC STONE WORK"
    </h2>
    {/* <p className="text-sm text-gray-600 mb-6 max-w-2xl">
  "RR STONES PVT LTD IS ONE OF INDIA'S PREMIER EXPORTERS OF NATURAL GRANITE, FELDSPAR AND QUARTZ PRODUCTS WITH AN ANNUAL TURNOVER OF USD 5 MILLION. WE PRODUCE OVER 100,000 TONS OF HAND CUT/DRESSED GRANITE PRODUCTS PER ANNUM AND OVER 50000 MT OF FELDSPAR AND QUARTZ POWDER PER ANNUM AND OWN QUARRY LEASES WITH ABUNDANT DEPOSITS OF STONES IN DIVERSE SHADES AND TEXTURES ACROSS SOUTH INDIA."
</p> */}

    <Button>Shop Now</Button>
  </section>
);

export default HeroSection;
