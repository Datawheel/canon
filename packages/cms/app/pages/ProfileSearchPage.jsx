import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import ProfileSearch from "../../src/components/fields/ProfileSearch";
import ProfileColumns from "../../src/components/fields/ProfileColumns";
import "./ProfileSearchPage.css";

class ProfileSearchPage extends Component {

  render() {

    const columnData = [
      [
        [
          {
            slug: "hs92",
            id: "5270900",
            memberSlug: "petroleum-oils-oils-from-bituminous-minerals-crude",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Petroleum oils, oils from bituminous minerals, crude",
            ranking: 53.9599443875171
          }
        ],
        [
          {
            slug: "hs92",
            id: "5271000",
            memberSlug: "oils-petroleum-bituminous-distillates-except-crude",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Oils petroleum, bituminous, distillates, except crude",
            ranking: 28.0090370685332
          }
        ],
        [
          {
            slug: "hs92",
            id: "52709",
            memberSlug: "crude-petroleum-52709",
            memberDimension: "HS Product",
            memberHierarchy: "HS4",
            name: "Crude Petroleum",
            ranking: 22.514374927694
          }
        ],
        [
          {
            slug: "hs92",
            id: "178703",
            memberSlug: "cars",
            memberDimension: "HS Product",
            memberHierarchy: "HS4",
            name: "Cars",
            ranking: 13.6994246974613
          }
        ],
        [
          {
            slug: "hs92",
            id: "17870323",
            memberSlug: "medium-sized-cars",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Medium Sized Cars",
            ranking: 13.0670073604943
          }
        ],
        [
          {
            slug: "hs92",
            id: "16851712",
            memberSlug: "telephones-for-cellular-networksfor-other-wireless-networks-other-than-line-telephone-sets-with-cordless-handsets",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Telephones for cellular networks or for other wireless networks",
            ranking: 12.4711234215621
          }
        ],
        [
          {
            slug: "hs92",
            id: "52710",
            memberSlug: "refined-petroleum-52710",
            memberDimension: "HS Product",
            memberHierarchy: "HS4",
            name: "Refined Petroleum",
            ranking: 11.6647094846958
          }
        ],
        [
          {
            slug: "hs92",
            id: "6300490",
            memberSlug: "medicaments-nes-in-dosage",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Medicaments nes, in dosage",
            ranking: 11.3861229195319
          }
        ],
        [
          {
            slug: "hs92",
            id: "16854219",
            memberSlug: "monolithic-integrated-circuits-except-digital",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Monolithic integrated circuits, except digital",
            ranking: 10.7082176625162
          }
        ],
        [
          {
            slug: "hs92",
            id: "16854211",
            memberSlug: "monolithic-integrated-circuits-digital",
            memberDimension: "HS Product",
            memberHierarchy: "HS6",
            name: "Monolithic integrated circuits, digital",
            ranking: 9.90504053469771
          }
        ]
      ],
      [
        [
          {
            slug: "country",
            id: "asirn",
            memberSlug: "iran",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Iran",
            ranking: 12.0956103803793
          }
        ],
        [
          {
            slug: "country",
            id: "asidn",
            memberSlug: "indonesia",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Indonesia",
            ranking: 12.0359805268016
          }
        ],
        [
          {
            slug: "country",
            id: "asvnm",
            memberSlug: "vietnam",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Vietnam",
            ranking: 4.23199915084339
          }
        ],
        [
          {
            slug: "country",
            id: "askor",
            memberSlug: "south-korea",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "South Korea",
            ranking: 2.85396265804863
          }
        ],
        [
          {
            slug: "country",
            id: "as",
            memberSlug: "asia-as",
            memberDimension: "Country",
            memberHierarchy: "Continent",
            name: "Asia",
            ranking: 2.8355842578913
          }
        ],
        [
          {
            slug: "country",
            id: "asjpn",
            memberSlug: "japan",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Japan",
            ranking: 1.86350244593779
          }
        ],
        [
          {
            slug: "country",
            id: "sacol",
            memberSlug: "colombia-sacol",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Colombia",
            ranking: 0.994269424930295
          }
        ],
        [
          {
            slug: "country",
            id: "aslbn",
            memberSlug: "lebanon",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Lebanon",
            ranking: 0.633894556025107
          }
        ],
        [
          {
            slug: "country",
            id: "sachl",
            memberSlug: "chile",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "Chile",
            ranking: 0.227147132160102
          }
        ],
        [
          {
            slug: "country",
            id: "xxwld",
            memberSlug: "world-xxwld",
            memberDimension: "Country",
            memberHierarchy: "Country",
            name: "World",
            ranking: 0.20457475970411
          }
        ]
      ]
    ];

    return (
      <React.Fragment>
        <h2>Columns Display</h2>
        <div className="profilesearchpage-area columns">

          <ProfileSearch
            display="columns"
            activeKey="s"
            showExamples={true}
            // availableProfiles={["country", "hs92"]}
            columnOrder={["hs92", "country"]}
            profileTitles={{country: "Cool Locations"}}
          />

        </div>
        <h2>Popup Display</h2>
        <div className="profilesearchpage-area popup">

          <ProfileSearch
            inputFontSize="xl"
            display="list"
            showExamples={true}
            profileTitles={{country: "Cool Locations"}}
            position="absolute" />

        </div>
        <h2>List Display</h2>
        <div className="profilesearchpage-area list">

          <ProfileSearch
            inputFontSize="md"
            display="list"
            availableProfiles={["country", "hs92"]}
          />

        </div>
        <h2>Manual Columns</h2>
        <ProfileColumns data={columnData} />
      </React.Fragment>
    );
  }

}

export default hot(ProfileSearchPage);
