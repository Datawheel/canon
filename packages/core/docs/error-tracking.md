# @datawheel/canon-core

## Opbeat Error Tracking

If you would like to enable error tracking using Opbeat, add these 3 environment variables after initializing the app in the Opbeat online interface:

```sh
export CANON_OPBEAT_APP=your-opbeat-app-id
export CANON_OPBEAT_ORG=your-opbeat-organization-id
export CANON_OPBEAT_TOKEN=your-opbeat-secret-token
```

*NOTE*: Opbeat runs as express middleware, and will only track in production environments.
