<h1 align="center">
  <img alt="recs2spotify" height="100" src=".github/logo.png" />
  <br>
  recs2spotify
  <br>
</h1>
<h4 align="center">Web extension for exporting selected thread from <b>music recs without context</b> Facebook group</h4>

### Installation
I've made this extension available via the following providers:
|Firefox|Chrome|Edge|
|--|--|--|
| [![Firefox][firefox_badge]](https://addons.mozilla.org/en-US/firefox/addon/recs2spotify/) | _Coming Soon_ | _Coming Soon_ |

### Usage
1. Install the extension via any of the providers above.
2. Go to [music recs without context](https://www.facebook.com/groups/1664811250303043/) Facebook group.
3. Open the extension and authenticate with your Spotify account.
4. Load the thread that you want to export. Make sure to collapse all comments by clicking "View More" to include them for export.
5. From the dropdown, select the thread that you want to export. Once selected click "Get List".
6. After getting the list, you should now have a preview of the tracks to be exported. Click "Create Playlist".
7. If the playlist is successfully created, you can view the playlist by clicking "Open Playlist".

### Development
I'm using Webpack to bundle all the necessary modules of the extension.

##### Prerequisites
- node
- Chrome/Firefox
- Spotify developer account

##### Setup
1. Clone this repository.
2. Install all the dependencies by running `yarn install`.
3. Run webpack with `yarn start`. This will watch for file changes.
4. Load the extension depending on the browser that you're using.
  - In Chrome, go to Extensions > Load Unpacked and load the `build/` directory.
  - In Firefox, install the node package `web-ext` and execute `web-ext build/`.
5. To build the bundle, enter `yarn build`. This will create the zipped bundle in `dist/`.

### Next Tasks
* [ ] cleanup code
* [ ] improve error handling
* [x] handle big thread
* [x] create _proper_ icon
* [x] release for Firefox
* [ ] allow curating tracks before export

### Support
If you have issues using the extension, feel free to send an email to [rrsilaya@gmail.com](mailto://rrsilaya@gmail.com/).

[firefox_badge]: ./.github/firefox-badge.png
[chrome_badge]: ./.github/chrome-badge.png

[firefox_link]: https://addons.mozilla.org/en-US/firefox/addon/recs2spotify/
