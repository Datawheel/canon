/**
  The object that this file exports will be used to pre-populate the redux
  store with any static values you may need.
*/
export default {
  example: {
    exampleList: {
      datachile: {
        name: "🇨🇱 DataChile",
        slug: "datachile-style",
        base: "https://chilecube.datachile.io",
        engine: "Mondrian",
        list: [
          {title: "Crimes by Crime Group in Region Metropolitana", query: "https://chilecube.datachile.io/cubes/crimes/aggregate.json?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&drilldown%5B%5D=%5BCrime%5D.%5BCrime+Group%5D&cut%5B%5D=%5BGeography%5D.%5BGeography%5D.%5BRegion%5D.%26%5B13%5D&measures%5B%5D=Cases&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: true},
          {title: "Number of Visas in Region Valparaiso", query: "https://chilecube.datachile.io/cubes/immigration/aggregate.jsonrecords?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&cut%5B%5D=%5BGeography%5D.%5BGeography%5D.%5BRegion%5D.%26%5B5%5D&measures%5B%5D=Number+of+visas&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: true},
          {title: "Income by Region", query: "https://chilecube.datachile.io/cubes/nesi_income/aggregate.json?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&measures%5B%5D=Income&measures%5B%5D=Median+Income&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: true}
        ]
      },
      datamexico: {
        name: "🇲🇽 DataMexico",
        slug: "datamexico-style",
        base: "https://api.datamexico.org",
        engine: "Tesseract + LogicLayer",
        list: [
          {title: "[LogicLayer] Products imports Aguascalientes", query: "https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1", tooltip: true},
          {title: "[LogicLayer] Occupations by number in Hospitals", query: "https://api.datamexico.org/tesseract/data?cube=inegi_enoe&Industry%20Group=6221&Quarter=20182,20183,20184,20191,20192&drilldowns=Occupation,Quarter&measures=Workforce,Wage&parents=true&sparse=false&locale=es", tooltip: true},
          {title: "[LogicLayer] Salary wage", query: "https://api.datamexico.org/tesseract/data?Industry%20Group=6221&cube=inegi_enoe&drilldowns=Salary%20Group,Quarter&measures=Workforce&parents=false&sparse=false", tooltip: true},
          {title: "[Tesseract] Households by Home Type and State", query: "https://api.datamexico.org/tesseract/cubes/inegi_housing/aggregate.jsonrecords?drilldowns%5B%5D=Geography.State&drilldowns%5B%5D=Home+Type.Home+Type&measures%5B%5D=Households&parents=false&sparse=false", tooltip: true},
          {title: "[Tesseract] Poverty by State By Year", query: "https://api.datamexico.org/tesseract/cubes/coneval_poverty/aggregate.jsonrecords?drilldowns%5B%5D=Year.Year.Year&drilldowns%5B%5D=Geography.Geography.State&measures%5B%5D=Poverty&measures%5B%5D=Extreme+Poverty&measures%5B%5D=Moderate+Poverty&parents=false&sparse=false", tooltip: true},
          {title: "[Tesseract] Crimes by Affected Good", query: "https://api.datamexico.org/tesseract/cubes/sesnsp_crimes/aggregate.jsonrecords?drilldowns%5B%5D=Geography.Geography.Nation&drilldowns%5B%5D=Type.Type.Affected+Legal+Good&measures%5B%5D=Value&parents=false&sparse=false", tooltip: true}
          // {title: "[Stats] RCA Calculation", query: "https://dev.datamexico.org/api/stats/relatedness?cube=economy_foreign_trade_mun&rca=State,Chapter,Trade%20Value&Year=2018", tooltip: true}
        ]
      },
      oec: {
        name: "🌐 OEC World",
        slug: "oec-style",
        base: "https://api.oec.world",
        engine: "Tesseract",
        list: [
          {title: "Product Exports from Kyrgyzstan", query: "https://api.oec.world/tesseract/data?cube=trade_i_baci_a_92&Exporter+Country=askgz&drilldowns=HS4&measures=Trade+Value&parents=true&time=year.latest&sparse=false", tooltip: true},
          {title: "Product Imports from Argentina", query: "https://api.oec.world/tesseract/data?cube=trade_i_baci_a_92&Importer%20Country=saarg&Year=2017&drilldowns=Exporter+Country&locale=&measures=Trade+Value&parents=true&sparse=false&properties=Exporter+Country+ISO+3", tooltip: true}
        ]
      }
    }
  }
};
