export const SUBNATIONAL_COUNTRIES = [
  {
    name: "Brazil",
    code: "bra",
    available: true,
    cube: "trade_s_bra_mun_m_hs",
    dimension: "Subnat Geography",
    limit: 7000,
    geoLevels: [

      /* {name: "Region", level: "Region", slug: "regions"},*/
      {name: "States", overrideCube: "trade_s_bra_ncm_m_hs", profileSlug: "subnational_bra_state", level: "Subnat Geography", slug: "states", ignoreIdsList: ["93", "95", "99"]},
      {name: "Municipalities", profileSlug: "subnational_bra_municipality", level: "Subnat Geography", slug: "municipalities"}
    ]
  },
  {
    name: "Japan",
    code: "jpn",
    available: true,
    cube: "trade_s_jpn_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Regions", level: "Region", slug: "regions", ignoreIdsList: ["0"]},
      {name: "Prefectures", level: "Subnat Geography", slug: "prefectures", ignoreIdsList: ["48", "20"]}
    ]
  },
  {
    name: "Russia",
    code: "rus",
    available: true,
    cube: "trade_s_rus_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {
        name: "Districts",
        level: "District",
        slug: "districts",
        extraMapConfig: {
          projectionRotate: [-70, 0]
        },
        ignoreIdsList: ["NN"]
      },
      {
        name: "Regions",
        level: "Subnat Geography",
        slug: "regions",
        extraMapConfig: {
          projectionRotate: [-90, 0]
        }
      }
    ]
  },
  {
    name: "Canada",
    code: "can",
    available: true,
    cube: "trade_s_can_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Provinces", level: "Subnat Geography", slug: "provinces", ignoreIdsList: ["1"]}
    ]
  },
  {
    name: "Uruguay",
    code: "ury",
    available: false,
    cube: "trade_s_ury_a_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Corridor", level: "Corridor", slug: "corridors", ignoreIdsList: ["na"]},
      {name: "Departments", level: "Subnat Geography", slug: "departments", ignoreIdsList: ["5"]}
    ]
  },
  {
    name: "Germany",
    code: "deu",
    available: true,
    cube: "trade_s_deu_m_egw",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Regions", level: "Subnat Geography", slug: "regions"}
    ]
  },
  {
    name: "USA",
    code: "usa",
    available: true,
    cube: "trade_s_usa_district_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {
        overrideCube: "trade_s_usa_state_m_hs",
        name: "States",
        level: "Subnat Geography",
        slug: "states",
        ignoreIdsMap: [
          "04000US60", "04000US69", "04000US66", "04000US99"
        ],
        extraMapConfig: {
          projection: "geoAlbersUsaTerritories"
        },
        profileSlug: "subnational_usa_state"
      },
      {
        name: "Districts",
        level: "Subnat Geography",
        slug: "districts",
        extraMapConfig: {
          projection: "geoAlbersUsaTerritories"
        },
        ignoreIdsMap: ["97", "98", "99"],
        profileSlug: "subnational_usa_district"
      },
      {
        overrideCube: "trade_s_usa_port_m_hs",
        name: "Ports",
        level: "Subnat Geography",
        slug: "ports",
        ignoreIdsMap: ["97", "98", "99"],
        extraMapConfig: {
          projection: "geoAlbersUsaTerritories"
        },
        profileSlug: "subnational_usa_port"
      }
    ]
  },
  {
    name: "Turkey",
    code: "tur",
    available: false,
    cube: "trade_s_tur_m_countries",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Provinces", level: "Subnat Geography", slug: "provinces"}
    ]
  },
  {
    name: "Spain",
    code: "esp",
    available: true,
    cube: "trade_s_esp_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {
        name: "Autonomous Communities", level: "Autonomous Communities", slug: "autonomous",
        extraMapConfig: {
          projection: "geoConicConformalSpain"
        },
        ignoreIdsList: ["100"]
      },
      {
        name: "Provinces", level: "Subnat Geography", slug: "provinces",
        extraMapConfig: {
          projection: "geoConicConformalSpain"
        },
        ignoreIdsList: ["0"]
      }
    ]
  },
  {
    name: "South Africa",
    code: "zaf",
    available: true,
    cube: "trade_s_zaf_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Ports", level: "Subnat Geography", slug: "ports"}
    ]
  },
  {
    name: "China",
    code: "chn",
    available: true,
    cube: "trade_s_chn_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Provinces", level: "Subnat Geography", slug: "provinces"}
    ]
  },
  {
    name: "France",
    code: "fra",
    available: false,
    cube: "trade_s_fra_q_cpf",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Regions", level: "Region", slug: "regions", ignoreIdsList: ["24"]},
      {name: "Departments", level: "Subnat Geography", slug: "departments"}
    ]
  },
  {
    name: "Bolivia",
    code: "bol",
    available: false,
    cube: "trade_s_bol_m_sitc3",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Departments", level: "Subnat Geography", slug: "departments"}
    ]
  },
  {
    name: "Ecuador",
    code: "ecu",
    available: false,
    cube: "trade_s_ecu_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Ports", level: "Subnat Geography", slug: "ports"}
    ]
  },
  {
    name: "United Kingdom",
    code: "gbr",
    available: true,
    cube: "trade_s_gbr_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Ports", level: "Subnat Geography", slug: "ports"}
    ]
  },
  {
    name: "Saudi Arabia",
    code: "sau",
    available: false,
    cube: "trade_s_sau_m_ports_of_entry",
    dimension: "Subnat Geography",
    geoLevels: [
      {name: "Ports", level: "Subnat Geography", slug: "ports"}
    ]
  },
  {
    name: "Chile",
    code: "chl",
    available: true,
    cube: "trade_s_chl_m_hs",
    dimension: "Subnat Geography",
    geoLevels: [
      {
        name: "Regions", level: "Region", slug: "regions",
        ignoreIdsList: ["99"],
        extraMapConfig: {
          projection: "geoTransverseMercatorChile"
        }
      },
      {
        name: "Comunas", level: "Subnat Geography", slug: "comunas",
        extraMapConfig: {
          projection: "geoTransverseMercatorChile"
        }
      }
    ]
  }

];
