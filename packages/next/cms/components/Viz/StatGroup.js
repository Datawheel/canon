import {
  Text, Group,
} from "@mantine/core";
import {Stat} from "../../../index";
import stripHTML from "../../utils/formatters/stripHTML";

const sanitize = (html) => html
  .replace(/±/g, "<span class='plus-minus'>±</span>")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

function StatGroup({className, stats = []}) {
  if (!stats.length) return console.log("`stats` array is empty in StatGroup.jsx");

  return stats.length > 1
    // grouped stats
    ? (
      <div>
        {stats.length > 1 && (
          <Text dangerouslySetInnerHTML={{__html: stripHTML(stats[0].title)}} />
        )}
        <Group>
          {stats.map((stat) => (
            <Stat
              className={className}
              label={null}
              value={sanitize(stat.value)}
              subtitle={sanitize(stat.subtitle)}
              key={`${stat.value}-${stat.subtitle}`}
            />
          ))}
        </Group>
      </div>
    )
    // single stat
    : (
      <Stat
        className={className}
        label={sanitize(stats[0].title)}
        value={sanitize(stats[0].value)}
        subtitle={sanitize(stats[0].subtitle)}
      />
    );
}

export default StatGroup;
