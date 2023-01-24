# client-plugin

# Requirements
### For settings API to sync with an API (so they don't reset on each client launch) you will need to disable web security. (Ban rate <= 3% according to league-loader creator).

To enable them, just put these options into `config.cfg`:

```ini
[Main]
DisableWebSecurity=1
```

For example, your `config.cfg` should look something like this:

```ini
[Main]
LeaguePath=C:\Riot Games\League of Legends
DisableWebSecurity=1
```
