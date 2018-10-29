const {Client} = require("mondrian-rest-client");
const d3Array = require("d3-array");
const sequelize = require("sequelize");
const shell = require("shelljs");
const Op = sequelize.Op;

const client = new Client(process.env.CANON_LOGICLAYER_CUBE);

const topicTypeDir = "src/components/topics/";

const profileReqTreeOnly = {
  attributes: ["id", "title", "slug", "dimension", "ordering"],
  include: [
    {
      association: "sections", attributes: ["id", "title", "slug", "ordering", "profile_id"],
      include: [
        {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id", "type"]}
      ]
    }
  ]
};

const storyReqTreeOnly = {
  attributes: ["id", "title", "ordering"],
  include: [
    {
      association: "storytopics", attributes: ["id", "title", "slug", "ordering", "story_id", "type"]
    }
  ]
};

const formatterReqTreeOnly = {
  attributes: ["id", "name"]
};

const profileReqProfileOnly = {
  include: [
    {association: "generators", attributes: ["id", "name"]},
    {association: "materializers", attributes: ["id", "name", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "footnotes", attributes: ["id", "ordering"]}
  ]
};

const storyReqStoryOnly = {
  include: [
    {association: "authors", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "footnotes", attributes: ["id", "ordering"]}
  ]
};

const sectionReqSectionOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]}
  ]
};

const topicReqTopicOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]},
    {association: "selectors"}
  ]
};

const storyTopicReqStoryTopicOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]}
  ]
};

const tableMap = {
  author: "authors",
  formatter: "formatters",
  generator: "generators",
  materializer: "materializers",
  profile: "profiles",
  profile_description: "profiles_descriptions",
  profile_footnote: "profiles_footnotes",
  profile_stat: "profiles_stats",
  profile_visualization: "profiles_visualizations",
  section: "sections",
  section_description: "sections_descriptions",
  section_subtitle: "sections_subtitles",
  selector: "selectors",
  story: "stories",
  story_description: "stories_descriptions",
  story_footnote: "stories_footnotes",
  storytopic: "storytopics",
  storytopic_description: "storytopics_descriptions",
  storytopic_stat: "storytopics_stats",
  storytopic_subtitle: "storytopics_subtitles",
  storytopic_visualization: "storytopics_visualizations",
  topic: "topics",
  topic_description: "topics_descriptions",
  topic_stat: "topics_stats",
  topic_subtitle: "topics_subtitles",
  topic_visualization: "topics_visualizations"
};

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. todo: move it up to the query.
const sortProfileTree = profiles => {
  profiles = profiles.map(p => p.toJSON());
  profiles.sort(sorter);
  profiles.forEach(p => {
    p.sections.sort(sorter);
    p.sections.forEach(s => {
      s.topics.sort(sorter);
    });
  });
  return profiles;
};

const sortStoryTree = stories => {
  stories = stories.map(s => s.toJSON());
  stories.sort(sorter);
  stories.forEach(s => {
    s.storytopics.sort(sorter);
  });
  return stories;
};

const sortProfile = profile => {
  profile = profile.toJSON();
  ["materializers", "visualizations", "stats", "descriptions", "footnotes"].forEach(type => profile[type].sort(sorter));
  return profile;
};

const sortStory = story => {
  story = story.toJSON();
  ["descriptions", "footnotes", "authors"].forEach(type => story[type].sort(sorter));
  return story;
};

const sortSection = section => {
  section = section.toJSON();
  ["subtitles", "descriptions"].forEach(type => section[type].sort(sorter));
  return section;
};

const sortTopic = topic => {
  topic = topic.toJSON();
  ["subtitles", "visualizations", "stats", "descriptions", "selectors"].forEach(type => topic[type].sort(sorter));
  return topic;
};

const sortStoryTopic = storytopic => {
  storytopic = storytopic.toJSON();
  ["subtitles", "visualizations", "stats", "descriptions"].forEach(type => storytopic[type].sort(sorter));
  return storytopic;
};

const formatter = (members, data, dimension, level) => {

  const newData = members.reduce((arr, d) => {
    const obj = {};
    obj.id = `${d.key}`;
    obj.name = d.name;
    obj.display = d.caption;
    obj.zvalue = data[obj.id] || 0;
    obj.dimension = dimension;
    obj.hierarchy = level;
    obj.stem = -1;
    arr.push(obj);
    return arr;
  }, []);
  const st = d3Array.deviation(newData, d => d.zvalue);
  const average = d3Array.median(newData, d => d.zvalue);
  newData.forEach(d => d.zvalue = (d.zvalue - average) / st);
  return newData;
};

const populateSearch = (profileData, db) => {
  
  /**
   *
   */
  async function start() {

    const cubeName = profileData.cubeName;
    const measure = profileData.measure;
    const dimension = profileData.dimName;

    const cube = await client.cube(cubeName);

    const levels = cube.dimensionsByName[dimension].hierarchies[0].levels.filter(l => l.name !== "(All)");

    let fullList = [];
    for (let i = 0; i < levels.length; i++) {

      const level = levels[i];
      const members = await client.members(level);

      const data = await client.query(cube.query
        .drilldown(dimension, dimension, level.name)
        .measure(measure), "jsonrecords")
        .then(resp => resp.data.data)
        .then(data => data.reduce((obj, d) => {
          obj[d[`ID ${level.name}`]] = d[measure];
          return obj;
        }, {}));

      fullList = fullList.concat(formatter(members, data, dimension, level.name));

    }

    for (let i = 0; i < fullList.length; i++) {
      const obj = fullList[i];
      const {id, dimension, hierarchy} = obj;
      const [row, created] = await db.search.findOrCreate({
        where: {id, dimension, hierarchy},
        defaults: obj
      });
      if (created) console.log(`Created: ${row.id} ${row.display}`);
      else {
        await row.updateAttributes(obj);
        console.log(`Updated: ${row.id} ${row.display}`);
      }
    }

  }

  start();
 
};

module.exports = function(app) {

  const {db} = app.settings;

  /* GETS */

  app.get("/api/cms/tree", (req, res) => {
    db.profiles.findAll(profileReqTreeOnly).then(profiles => {
      profiles = sortProfileTree(profiles);
      res.json(profiles).end();
    });
  });

  app.get("/api/cms/storytree", (req, res) => {
    db.stories.findAll(storyReqTreeOnly).then(stories => {
      stories = sortStoryTree(stories);
      res.json(stories).end();
    });
  });  

  app.get("/api/cms/formattertree", (req, res) => {
    db.formatters.findAll(formatterReqTreeOnly).then(formatters => {
      res.json(formatters).end();
    });
  });

  app.get("/api/cms/profile/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, profileReqProfileOnly, {where: {id}});
    db.profiles.findOne(reqObj).then(profile => {
      res.json(sortProfile(profile)).end();
    });
  });

  app.get("/api/cms/story/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyReqStoryOnly, {where: {id}});
    db.stories.findOne(reqObj).then(story => {
      res.json(sortStory(story)).end();
    });
  });

  app.get("/api/cms/section/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, sectionReqSectionOnly, {where: {id}});
    db.sections.findOne(reqObj).then(section => {
      res.json(sortSection(section)).end();
    });
  });

  app.get("/api/cms/topic/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, topicReqTopicOnly, {where: {id}});
    db.topics.findOne(reqObj).then(topic => {
      const topicTypes = [];
      shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
        const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
        topicTypes.push(compName);
      });
      topic = sortTopic(topic);
      topic.types = topicTypes;
      res.json(topic).end();
    });
  });

  app.get("/api/cms/storytopic/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyTopicReqStoryTopicOnly, {where: {id}});
    db.storytopics.findOne(reqObj).then(storytopic => {
      const topicTypes = [];
      shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
        const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
        topicTypes.push(compName);
      });
      storytopic = sortStoryTopic(storytopic);
      storytopic.types = topicTypes;
      res.json(storytopic).end();
    });
  });

  const getList = Object.keys(tableMap).filter(key => 
    !["profile", "section", "topic", "story", "storytopic"].includes(key)
  );

  getList.forEach(ref => {
    app.get(`/api/cms/${ref}/get/:id`, (req, res) => {
      db[tableMap[ref]].findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
    });
  });

  /* INSERTS */
  const newList = Object.keys(tableMap);
  newList.forEach(ref => {
    app.post(`/api/cms/${ref}/new`, (req, res) => {
      db[tableMap[ref]].create(req.body).then(u => res.json(u));
    });
  });

  app.post("/api/cms/profile/newScaffold", (req, res) => {
    const profileData = req.body;
    db.profiles.create({slug: profileData.slug, ordering: profileData.ordering, dimension: profileData.dimName}).then(profile => {
      db.sections.create({ordering: 0, profile_id: profile.id}).then(section => {
        db.topics.create({ordering: 0, section_id: section.id}).then(() => {
          db.profiles.findAll(profileReqTreeOnly).then(profiles => {
            profiles = sortProfileTree(profiles);
            populateSearch(profileData, db);
            res.json(profiles).end();
          });
        });
      });
    });
  });

  /* UPDATES */
  const updateList = Object.keys(tableMap);
  updateList.forEach(ref => {
    app.post(`/api/cms/${ref}/update`, (req, res) => {
      db[tableMap[ref]].update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
    });
  });

  /* DELETES */
  /**
   * To streamline deletes, this list contains objects with two properties. "elements" refers to the tables to be modified,
   * and "parent" refers to the foreign key that need be referenced in the associated where clause.
   */
  const deleteList = [
    {elements: ["profile_description", "profile_footnote", "profile_stat", "profile_visualization"], parent: "profile_id"},
    {elements: ["section_description", "section_subtitle"], parent: "section_id"},
    {elements: ["author", "story_description", "story_footnote"], parent: "story_id"},
    {elements: ["topic_subtitle", "topic_description", "topic_stat", "topic_visualization"], parent: "topic_id"}
  ];

  deleteList.forEach(list => {
    list.elements.forEach(ref => {
      app.delete(`/api/cms/${ref}/delete`, (req, res) => {
        db[tableMap[ref]].findOne({where: {id: req.query.id}}).then(row => {
          // Construct a where clause that looks someting like: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}
          // except "profile_id" is the "parent" in the array above
          const where1 = {ordering: {[Op.gt]: row.ordering}};
          where1[list.parent] = row[list.parent];
          db[tableMap[ref]].update({ordering: sequelize.literal("ordering -1")}, {where: where1}).then(() => {
            db[tableMap[ref]].destroy({where: {id: req.query.id}}).then(() => {
              const where2 = {};
              where2[list.parent] = row[list.parent];
              db[tableMap[ref]].findAll({where: where2, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
                res.json(rows).end();
              });
            });
          });
        });
      });
    });
  });

  // Other (More Complex) Elements
  app.delete("/api/cms/generator/delete", (req, res) => {
    db.generators.findOne({where: {id: req.query.id}}).then(row => {
      db.generators.destroy({where: {id: req.query.id}}).then(() => {
        db.generators.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "name"]}).then(rows => {
          res.json(rows).end();
        });
      });
    });
  });

  app.delete("/api/cms/materializer/delete", (req, res) => {
    db.materializers.findOne({where: {id: req.query.id}}).then(row => {
      db.materializers.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.materializers.destroy({where: {id: req.query.id}}).then(() => {
          db.materializers.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering", "name"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/profile/delete", (req, res) => {
    db.profiles.findOne({where: {id: req.query.id}}).then(row => {
      db.profiles.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.profiles.destroy({where: {id: req.query.id}}).then(() => {
          db.profiles.findAll(profileReqTreeOnly).then(profiles => {
            profiles = sortProfileTree(profiles);
            res.json(profiles).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/story/delete", (req, res) => {
    db.stories.findOne({where: {id: req.query.id}}).then(row => {
      db.stories.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.stories.destroy({where: {id: req.query.id}}).then(() => {
          db.stories.findAll(storyReqTreeOnly).then(stories => {
            stories = sortStoryTree(stories);
            res.json(stories).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/formatter/delete", (req, res) => {
    db.formatters.destroy({where: {id: req.query.id}}).then(() => {
      db.formatters.findAll({attributes: ["id", "name", "description"]}).then(rows => {
        res.json(rows).end();
      });
    });
  });

  app.delete("/api/cms/section/delete", (req, res) => {
    db.sections.findOne({where: {id: req.query.id}}).then(row => {
      db.sections.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.sections.destroy({where: {id: req.query.id}}).then(() => {
          db.sections.findAll({
            where: {profile_id: row.profile_id},
            attributes: ["id", "title", "slug", "ordering", "profile_id"],
            order: [["ordering", "ASC"]],
            include: [
              {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id"]}
            ]
          }).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/topic/delete", (req, res) => {
    db.topics.findOne({where: {id: req.query.id}}).then(row => {
      db.topics.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics.destroy({where: {id: req.query.id}}).then(() => {
          db.topics.findAll({where: {section_id: row.section_id}, attributes: ["id", "title", "slug", "ordering", "section_id", "type"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/storytopic/delete", (req, res) => {
    db.storytopics.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics.findAll({where: {story_id: row.story_id}, attributes: ["id", "title", "slug", "ordering", "story_id", "type"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.delete("/api/cms/selector/delete", (req, res) => {
    db.selectors.findOne({where: {id: req.query.id}}).then(row => {
      db.selectors.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.selectors.destroy({where: {id: req.query.id}}).then(() => {
          db.selectors.findAll({where: {topic_id: row.topic_id}, order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

};
