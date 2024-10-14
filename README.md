# ChallengeLatinAdPlayer

### Tasks

#### Window:

-   [x] The player must operate in full screen and in windowless mode.
-   [x] Allow configuring the window dimensions (height, width) and its initial position (X, Y coordinates from the top left corner).
-   [x] The mouse cursor must be hidden when over the player window.

#### Content Playback:

-   [x] The player must play images and videos in a loop.
-   [x] Images and videos must be downloaded locally to ensure the player works without internet.
-   [x] Use a library like NeDB or LokiDB for the local database.
-   [ ] Playback must be gapless (no black screens between ads), preloading the next ad in a hidden div.
-   [x] Display ads filling the entire screen or respecting the aspect ratio, according to the "fill_screen" field (CSS object-fit: fill or contain).

#### Order, duration, and content filtering:

-   [x] Respect the playback order based on the "position" field, playing ads in ascending order.
-   [x] Each ad must play for the time specified in the "length" field (milliseconds).
-   [x] Play only ads within the date range specified by "from_date" and "to_date".
-   [x] Automatically delete downloaded files of ads that should no longer be played.

#### Content Query and Update:

-   [x] Query a backend every 10 seconds to get the list of ads to play.
-   [x] Update ads immediately if changes are detected in the "updated_at" field.
-   [x] Update local content

### Execution:

-   To run the application directly
    ```bash
      npm run start
    ```
-   The application can also be run in debug mode

### Endpoints

-   **GET /content/**

    -   Description: Receives the list of contents to play
    -   Response: JSON array of ad objects

-   **GET /player/**
    -   Description: Receives the player configuration
    -   Response: JSON object
