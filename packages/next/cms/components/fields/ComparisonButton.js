import React, {useContext} from "react";
import {useRouter} from "next/router";

import {UnstyledButton, Button, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {IconSquarePlus, IconSquareMinus} from "@tabler/icons-react";

import ProfileContext from "../ProfileContext";
import {ProfileSearch} from "./ProfileSearch";

const ComparisonButton = () => {
  const [comparisonSearch, comparisonSearchHandlers] = useDisclosure(false);
  const router = useRouter();
  const {pathname, query} = router;
  const {t, variables, compareSlug, profileId} = useContext(ProfileContext);

  const addComparison = slug => router.replace(
    {pathname,
      query: {
        ...query,
        compare: slug
      }
    },
    undefined,
    {shallow: true});

  const removeComparison = () => {
    const newQuery = {...query};
    delete newQuery.compare;
    router.replace(
      {pathname, query: newQuery},
      undefined,
      {shallow: true}
    );
  };
  const handleClick = compareSlug
    ? removeComparison
    : comparisonSearchHandlers.toggle;

  return <div className="cp-comparison-add" style={{position: "relative"}}>
    {
      comparisonSearch &&
      <ProfileSearch
        t={t}
        defaultProfiles={`${profileId}`}
        display="list"
        inputProps={{size: "sm"}}
        renderListItem={(result, i, link, title, subtitle) =>
          result[0].id === variables.id
            ? null
            : <li key={`r-${i}`} className="cms-profilesearch-list-item">
              <UnstyledButton
                onClick={() => addComparison(result[0].memberSlug)}
                className="cms-profilesearch-list-item-link">
                {title}
                <Text size="xs" className="cms-profilesearch-list-item-sub">{subtitle}</Text>
              </UnstyledButton>
            </li>
        }
        pos="absolute"
        sx={{zIndex: 9, top: "100%"}}
      />
    }
    <Button
      onClick={handleClick}
      leftIcon={!compareSlug ? <IconSquarePlus size="0.8rem" /> : <IconSquareMinus size="0.8rem" />}
      size="xs"
      // variant="light"
      compact>{t("CMS.Profile.Add Comparison")}</Button>
  </div>;
};

export default ComparisonButton;
