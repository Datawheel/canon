import React from "react";
import {
  TypographyStylesProvider,
} from "@mantine/core";
import {NonIdealState, ProfileRenderer} from "../..";

function Profile(props) {
  const {profile} = props;

  if (profile.error) {
    const {error, errorCode} = profile;
    const errorMessages = {
      404: "Page Not Found",
    };
    return (
      <NonIdealState
        message={errorMessages[errorCode] || `Error: ${errorCode}`}
        description={error}

      />
    );
  }

  return (
    <TypographyStylesProvider>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ProfileRenderer {...props} />
    </TypographyStylesProvider>
  );
}

export default Profile;
