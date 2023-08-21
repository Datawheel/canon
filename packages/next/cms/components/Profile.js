import React from "react";
import {
  TypographyStylesProvider, MantineProvider,
} from "@mantine/core";
import {NonIdealState, ProfileRenderer} from "../..";

function Profile(props) {
  const {profile, mantineProviderProps, LoaderComponent = NonIdealState} = props;

  if (profile.error) {
    const {error, errorCode} = profile;
    const errorMessages = {
      404: "Page Not Found",
    };
    return (
      <LoaderComponent
        message={errorMessages[errorCode] || `Error: ${errorCode}`}
        description={error}

      />
    );
  }

  return (
    <MantineProvider {...mantineProviderProps} inherit>
      <TypographyStylesProvider>
        <ProfileRenderer {...props} />
      </TypographyStylesProvider>
    </MantineProvider>
  );
}

export default Profile;
