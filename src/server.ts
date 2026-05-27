import { app } from "./app.js";
import { env } from "./config/env.js";

// Start listening for HTTP requests on the configured port.
app.listen(env.PORT, () => {
  console.log(`WeatherTrack API running on port ${env.PORT}`);
});
