/**
 * legacy
 */
// let cheetosAdded = false;
// let autoAcceptObserver;

/**
 * used to store the client state, so we can add/remove shit based on state
 * matchmaking when in queue, readyCheck when queue pops, ChampSelect when in champ select
 */
let CLIENT_STATE = null;

let champSelectInterval = null;

/**
 * used to store the interval for auto accept, so we can close it in case user disables setting
 */
let acceptInterval;

let dodgeButtonAdded = false;

/**
 * used to store the injected css elements, so we can remove them in case user disables setting
 * structure: { key: cssElement }
 */
const INJECTED_CSS = {};

/**
 * used to store the interval for each observers, so we can close them in case user disables setting
 * structure: { key: interval }
 */
const OBSERVER_INTERVALS = {};

/**
 * runeSelectorObserver, used to store the observer for rune page, so we can remove it in case user disables setting
 */
let runeSelectorObserver = null;


/**
 * used to store settings api url. 
 * 
 * Settings are saved and loaded from this API.
 */
const SETTINGS_API_URL = '';

/**
 * used to store the summoner id, so we can send it to API
 * 
 * can be set to your wanted summ id to sync settings
 */
let SUMMONER_ID = null;

/**
 * sleep for ms milliseconds
 * @param {*} ms 
 * @returns resolves when ms milliseconds have passed
 */
async function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSummonerID() {
   const { summonerId } = await getHeaders();
   // if summonerId is undefined, sleep for 100ms and try again
   if (!summonerId) {
      await sleep(100);
      return getSummonerID();
   }
   return summonerId;
}

/**
 * Generate settings object from local storage
 */
const generateSettings = () => {
   const settings = {};
   for (const key in CHEATS) {
      console.log(key, localStorage.getItem(key));
      settings[key] = localStorage.getItem(key) === 'true';
   }
   console.log(settings);
   return settings;
}

/**
 * Send settings to API
 * @param {object} data settings object
 */
const saveSettingsObject = async (data) => {
   if (!SETTINGS_API_URL) return console.error('SETTINGS_API_URL not set');
   console.log("SAVING", data);
   const response = await fetch(`${SETTINGS_API_URL}/${SUMMONER_ID}`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
   });
   return response.json();
}

/**
 * Get settings from localStorage and send them to API
*/
const generateAndSaveSettings = async () => {
   const settings = generateSettings();
   const response = await saveSettingsObject(settings);
   return response;
}

/**
 * get saved settings from API
 * @returns settings object
 */
const getSettings = async () => {
   if (!SETTINGS_API_URL) return console.error('SETTINGS_API_URL not set');
   const response = await fetch(`${SETTINGS_API_URL}/${SUMMONER_ID}`, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
      },
   });
   return response.json();
}


/**
 * generates description (<label> element) for setting
 * @param {string} text 
 * @returns {LabelElement} <label> element
 */
const generateDescription = (text) => {
   const label = document.createElement('label');
   label.classList.add('lol-settings-ingame-sound-description-text');
   // label.classList.add('description-text');
   label.textContent = text;
   return label;
}

const setSetting = async (key, value) => {
   if (window.localStorage.getItem(key) === value) return;
   window.localStorage.setItem(key, value);
   console.log("SETTING ", key, value);
   return await generateAndSaveSettings();
}

/**
 * 
 * @param {keyof CHEATS} key a key used to set input name and id, usually keyof CHEATS
 * @param {CHEATS[keyof CHEATS]} cheat object with cheat function, usually an entry in CHEATS
 * @returns {CheckboxElement} <lol-uikit-flat-checkbox> element
 */
const generateCheckbox = (key, cheat, checked) => {
   const lol_uikit_flat_checkbox = document.createElement('lol-uikit-flat-checkbox');
   lol_uikit_flat_checkbox.setAttribute('for', key);
   const input2 = document.createElement('input');
   input2.slot = 'input';
   input2.checked = checked;
   input2.name = key;
   input2.type = 'checkbox';
   input2.id = key;
   input2.classList.add('ember-checkbox');
   input2.classList.add('ember-view');
   const label = document.createElement('label');
   label.slot = 'label';
   label.textContent = cheat.name;
   lol_uikit_flat_checkbox.append(input2);
   lol_uikit_flat_checkbox.append(label);
   input2.addEventListener('change', (e) => {
      cheat.func(e.target.checked);
   });
   return lol_uikit_flat_checkbox;
}

/**
 * 
 * @param {string} name name of input 
 * @param {string} type input type (text | number , etc) 
 * @param {string} value input value
 * @param {string} placeholder placeholder text
 * @returns {InputElement} <lol-uikit-flat-input> element
 */
const generateInputHTML = (name, type, value, placeholder) => {
   const input = document.createElement('lol-uikit-flat-input');
   input.style.marginBottom = '12px';
   const searchbox = document.createElement('input');
   searchbox.type = type;
   searchbox.style.width = '200px';
   searchbox.name = name;
   searchbox.value = value;
   searchbox.placeholder = placeholder;
   searchbox.classList.add('ember-text-field');
   searchbox.classList.add('ember-view');
   input.append(searchbox);
   return input;
}

const generateButton = (key, cheat) => {
   const lol_uikit_flat_button = document.createElement('lol-uikit-flat-button-secondary');
   lol_uikit_flat_button.style.display = 'flex';
   lol_uikit_flat_button.textContent = cheat.name;
   lol_uikit_flat_button.setAttribute('for', key);
   lol_uikit_flat_button.setAttribute('size', 'small');

   lol_uikit_flat_button.addEventListener('click', (e) => {
      cheat.func();
   });

   return lol_uikit_flat_button;
}

const generateButtonHTML = (name, onclick, secondary = true) => {
   const lol_uikit_flat_button = document.createElement(`lol-uikit-flat-button${secondary ? '-secondary' : ''}`);
   lol_uikit_flat_button.style.display = 'flex';
   lol_uikit_flat_button.textContent = name;
   lol_uikit_flat_button.setAttribute('size', 'small');
   lol_uikit_flat_button.addEventListener('click', (e) => {
      onclick();
   });
   return lol_uikit_flat_button;
}

const generateSelect = (key, cheat) => {
   const lol_uikit_flat_select = document.createElement('lol-uikit-flat-select');
   lol_uikit_flat_select.setAttribute('for', key);
   const select = document.createElement('select');
   select.slot = 'select';
   select.name = key;
   select.id = key;
   select.classList.add('ember-select');
   select.classList.add('ember-view');

   for (const key in cheat.options) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = cheat.options[key];
      select.append(option);
   }
   lol_uikit_flat_select.append(select);

   return lol_uikit_flat_select;
}

const generateSelectHTML = (name, options, valueKey, displayKey) => {
   const lol_uikit_flat_select = document.createElement('lol-uikit-flat-select');
   lol_uikit_flat_select.style.marginBottom = '12px';
   lol_uikit_flat_select.setAttribute('size', 'small');
   const select = document.createElement('select');
   select.slot = 'select';
   select.name = name;
   select.classList.add('ember-select');
   select.classList.add('ember-view');
   select.style.marginBottom = '12px';
   for (const option of options) {
      const option2 = document.createElement('option');
      option2.value = valueKey ? option[valueKey] : option;
      option2.textContent = displayKey ? option[displayKey] : option;
      select.append(option2);
   }
   lol_uikit_flat_select.append(select);
   return lol_uikit_flat_select;
}

const generateHTML = async (key, cheat) => {
   return await cheat.html();
}
// not in use atm - adds settings to friend list as a "group" 
// const generateSettingsHTML = (cheatList) => {
//    const lol_social_roster_group = document.createElement('div');
//    lol_social_roster_group.classList.add('lol-social-roster-group');
//    lol_social_roster_group.classList.add('cheetos');
//    const group = document.createElement('div');
//    group.classList.add('group');
//    group.classList.add('use-animation');
//    const group_header = document.createElement('div');
//    group_header.classList.add('group-header');
//    const arrow_container = document.createElement('div');
//    arrow_container.classList.add('arrow-container');
//    arrow_container.classList.add('use-animation');
//    const arrow = document.createElement('lol-social-arrow-toggle');
//    arrow.classList.add('arrow');
//    const arrow_toggle = document.createElement('div');
//    arrow_toggle.classList.add('arrow-toggle');
//    arrow_toggle.classList.add('use-animation');
//    const group_name = document.createElement('div');
//    group_name.classList.add("lol-social-roster-group-name");
//    group_name.classList.add('group-name');
//    const group_name_text = document.createElement('div');
//    group_name_text.classList.add('group-name-text');
//    const group_label = document.createElement('div');
//    group_label.classList.add('group-label');
//    const span = document.createElement('span');
//    const span2 = document.createElement('span');
//    span2.setAttribute('dir', 'auto');
//    span2.textContent = 'CHEETOS';
//    span.append(span2);
//    group_label.append(span);
//    group_name_text.append(group_label);
//    group_name.append(group_name_text);
//    arrow_toggle.append(arrow);
//    arrow_container.append(arrow_toggle);
//    group_header.append(arrow_container);
//    group_header.append(group_name);
//    group.append(group_header);
//    lol_social_roster_group.append(group);

//    const input = document.createElement('input');
//    input.type = 'checkbox';
//    input.id = 'touch';
//    group_name.append(input);

//    const slide_ul = document.createElement('ul');
//    slide_ul.classList.add('slide');


//    for (const key in cheatList) {
//       const cheat = cheatList[key];
//       const lol_settings_general_row = document.createElement('div');
//       lol_settings_general_row.classList.add('lol-settings-general-row');
//       lol_settings_general_row.style.marginBottom = '12px';
//       if (cheat.type === 'checkbox') {
//          const lol_uikit_flat_checkbox = generateCheckbox(key, cheat);
//          lol_settings_general_row.append(lol_uikit_flat_checkbox);
//       } else if (cheat.type === 'button') {
//          const lol_uikit_flat_button = generateButton(key, cheat);
//          lol_settings_general_row.append(lol_uikit_flat_button);
//       } else if (cheat.type === 'select') {
//          const lol_uikit_flat_select = generateSelect(key, cheat);
//          lol_settings_general_row.append(lol_uikit_flat_select);
//       } else if (cheat.type === 'html') {
//          lol_settings_general_row.innerHTML += cheat.html;
//       }
//       if (cheat.description) {
//          const description = generateDescription(cheat.description);
//          lol_settings_general_row.append(description);
//       }
//       slide_ul.append(lol_settings_general_row);
//    }
//    group_name.append(slide_ul);


//    lol_social_roster_group.addEventListener('click', (e) => {
//       console.log('clicked', e.target);
//       if (e.target != slide_ul && slide_ul.contains(e.target)) return;
//       input.checked = !input.checked;
//       if (input.checked) {
//          arrow.setAttribute('open', input.checked);
//       } else {
//          arrow.removeAttribute('open');
//       }

//    });

//    return lol_social_roster_group;
// }

// const addCheetos = () => {
//    const friendList = document.querySelector('.roster-block');
//    if (friendList && !cheetosAdded) {
//       friendList.prepend(generateSettingsHTML(CHEATS));
//       cheetosAdded = true;
//       return true;
//    } else {
//       console.log(friendList, cheetosAdded);
//       return false;
//    }
// }

// const attemptToAddCheetos = setInterval(() => {
//    const added = addCheetos();
//    if (added) {
//       clearInterval(attemptToAddCheetos);
//    }
// }, 1000)

async function getCommandLineArgs() {
   const data = await fetch("/riotclient/command-line-args").then(res => res.json())

   return data;
}

async function createLobby(id) {
   return await fetch("/lol-lobby/v2/lobby", {
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ "queueId": id }),
      method: "POST",
   }).then(res => res.json());
}

async function playAgain() {
   const voteSkipButton = document.querySelector('.prompted-voting-skip-button');
   if (voteSkipButton) {
      voteSkipButton.click();
   }
   await fetch("/lol-lobby/v2/play-again", {
      method: "POST",
   });
}

async function startQueue() {
   console.log("starting queue");
   // TODO: wait for find match button to become active
   return await fetch("/lol-lobby/v2/lobby/matchmaking/search", {
      method: "POST",
   });
}

/**
 * accepts the match found popup
 */
function acceptMatchFound() {
   return fetch('/lol-matchmaking/v1/ready-check/accept', {
      method: 'POST'
   })
}

/**
 * dodges the match, you still lose LP
 */
function dodgeMatch() {
   console.log('called dodge');
   fetch('/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=["","teambuilder-draft","quitV2",""]', {
      method: 'POST'
   });
}

/**
 * gets summoner data of the player
 * @param {Object} player player object, uses summonerId and nameVisibilityType
 */
async function getPlayer(player) {
   if (player.nameVisibilityType === 'Hidden') {
      const response = await fetch('/chat/v5/participants/champ-select');
      const data = await response.json();
   } else {
      const response = await fetch(`/lol-summoner/v1/summoners/${player.summonerId}`);
      const data = await response.json();
      return data;
   }
}

/**
 * gets friend list
 * @returns {Object[]} array of friends' summoner data
 */
async function getFriends() {
   const data = await fetch("/lol-chat/v1/friends");
   const friends = await data.json();
   return friends;
}

/**
 * gets request headers from a fetch request
 * @returns {Object} port and idToken
 */
async function getHeaders() {
   const response = await fetch('/lol-login/v1/session');
   const session = await response.json();
   const url = response.url;
   //extract port from url
   const port = url.split(':')[2].split('/')[0];
   return { port, ...session };
}

/**
 * gets access token, riot started using this instead of idToken
 * @returns {Object} object with access token
 */
async function getToken() {
   const response = await fetch("/lol-rso-auth/v1/authorization/access-token");
   const data = await response.json();
   return data;
}

/**
 * clicks the 'edit runes' button in rune selector modal
 */
async function clickManualRunes() {
   document.querySelector(".runes-recommender-header > div:nth-child(2) > div").click();
}

/**
 * adds mutation observer to the target element. if the target element is not found, it will try again every 500ms
 * observer intervals added to OBSERVER_INTERVALS object, so they can be cleared later
 * @param {MutationObserver} observer observer to add
 * @param {string} targetSelector selector of the target element
 * @param {Object} config config object for the observer
 * @param {string} key key to add the interval to OBSERVER_INTERVALS object
 * @returns {Promise} promise that resolves when the observer is added
 */
function addObserver(observer, targetSelector, config, key) {
   console.log('adding observer', targetSelector, key)
   // const interval = setInterval(() => {
   //    const target = document.querySelector(targetSelector);
   //    console.log(`[${key}] target:`, target, `selector: ${targetSelector}`)
   //    if (target) {
   //       console.log(`[${key}] FOUND!`, target)
   //       clearInterval(interval);
   //       observer.observe(target, config);
   //    }
   // }, 500);
   const interval = setInterval(() => {
      const target = document.querySelector(
         targetSelector
      );
      if (target) {
         console.log("FOUND!!");
         clearInterval(interval);
         observer.observe(target, config);
      }
   }, 500);

   OBSERVER_INTERVALS[key] = interval;
}

/**
 * throttles a function, so it doesn't get called too often
 * @param {Function} fn function to throttle
 * @param {number} threshhold time in ms to wait before calling the function again
 * @param {Object} scope scope of the function
 */
function throttle(fn, threshhold, scope) {
   threshhold || (threshhold = 250);
   var last,
      deferTimer;
   return function () {
      var context = scope || this;

      var now = +new Date,
         args = arguments;
      if (last && now < last + threshhold) {
         // hold on to it
         clearTimeout(deferTimer);
         deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
         }, threshhold);
      } else {
         last = now;
         fn.apply(context, args);
      }
   };
}

/**
 * CHEATS object that gets looped to add the cheats to the settings
 * @param name name of the cheat, displayed in the settings
 * @param type type of the cheat, @see GENERATORS
 * @param func function to run when the cheat is toggled
 * @param description description of the cheat, displayed in the settings
 */
const CHEATS = {
   autoAccept: {
      name: 'Auto Accept',
      type: 'checkbox',
      func: async (checked) => {
         console.log("auto accept:");
         await setSetting('autoAccept', checked);
      }
   },
   refundLastPurchase: {
      name: 'Refund Last Purchase',
      type: 'button',
      // description: 'Buy a champion, pick it during a game and click this button before the game ends, no refund token will be used to refund it',
      func: async () => {
         console.log('refund last purchase:');
         const storeUrl = await fetch('/lol-store/v1/getStoreUrl').then((res) => {
            return res.json();
         });
         const session = await fetch('/lol-login/v1/session').then((res) => {
            return res.json();
         });
         if (!session) return;
         const { token } = await getToken();
         const accountId = session.accountId;
         const purchaseHistory = await fetch(`${storeUrl}/storefront/v3/history/purchase`, {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Accept': 'application/json',
               'Content-Type': 'application/json'
            }
         }).then((res) => {
            return res.json();
         });
         if (!purchaseHistory || purchaseHistory.transactions.length <= 0) return;
         const lastPurchase = purchaseHistory.transactions[0];
         console.log(purchaseHistory);
         const refund = await fetch(`${storeUrl}/storefront/v3/refund`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Accept': 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               accountId,
               transactionId: lastPurchase.transactionId,
               inventoryType: lastPurchase.inventoryType,
               language: 'EN_US'
            })
         }).then((res) => {
            return res.json();
         });
         console.log(refund);
      }
   },
   dodgeMatch: {
      name: 'Dodge Match',
      description: 'You still lose LP',
      type: 'button',
      func: () => {
         console.log('dodge match:');
         dodgeMatch();
      }
   },
   createLobby: {
      name: 'Create Lobby',
      description: 'Create a lobby with the selected settings',
      type: 'button',
      func: async () => {
         // TODO: add settings for this, gameIds select
         await createLobby(900);
      },
   },
   autoReQueue: {
      name: 'Auto Re-Queue',
      description: 'Automatically re-queue after a game',
      type: 'checkbox',
      func: async (checked) => {
         console.log('auto re-queue:');
         await setSetting('autoReQueue', checked);
      }
   },
   multiSearch: {
      name: 'Multi Search',
      description: 'Reveal lobby users',
      type: 'button',
      func: async () => {
         console.log('multi search:');
         const champSelect = await fetch('/lol-champ-select/v1/session').then((res) => res.json());
         if (champSelect.errorCode) return;
         let team = [];
         if (!champSelect.myTeam) return;
         let reqHeaders;
         let isRanked = false;
         if (champSelect.myTeam[0].nameVisibilityType.toLowerCase() == 'hidden') {
            isRanked = true;
            reqHeaders = await getHeaders();
         }

         console.log("ranked", isRanked);

         if (isRanked) {
            const response = await fetch('/chat/v5/participants/champ-select', {
               method: 'GET',
               headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
               }
            });
            const data = await response.json();
            team = data.participants;
         } else {
            for (const player of champSelect.myTeam) {
               team.push(await getPlayer(player))
            }
         }

         console.log(team);
         const region = await fetch('/riotclient/get_region_locale').then((res) => res.json());
         const regionCode = region.webRegion;
         const summonerNames = team.map((player) => player.displayName);
         const summonerNamesString = summonerNames.join(',');
         const url = `https://${regionCode}.op.gg/multi/query=${summonerNamesString}`;
         console.log(region, url);
      }
   },
   hideRuneRecommender: {
      name: 'Hide Rune Recommender',
      type: 'checkbox',
      description: 'Hide the rune recommender button and automatically click the manual runes button',
      func: async (checked) => {
         console.log('hide rune recommender:');
         if (checked) {
            injectCSS('hideRuneRecommender', `
            /* button in rune-recommender page */
            .runes-recommender-header > :first-child {
               display: none;
            }
            /* button in manual-runes page */
            .perks-body-header .clickable-icon-label-container {
                  display: none !important;
            }
           `);


            runeSelectorObserver = new MutationObserver((mutations) => {
               const addedNodes = mutations.find((record) => Array.from(record.addedNodes));
               if (addedNodes) {
                  for (const node of addedNodes.addedNodes) {
                     console.log(node);
                     if (node.querySelector('.runes-application')) {
                        console.log("YES :)");
                        setTimeout(() => {
                           return clickManualRunes();
                        }, 300); // for some reason it doesn't work without a timeout
                     }
                  }
               }
               // const el = document.querySelector(`.runes-application`);
               // if (el) {
               //    const selectedPage = document.querySelector(".runes-application > :first-child");
               //    const runesRecommenderSelected = selectedPage?.classList.contains('runes-recommender-root');
               //    if(runesRecommenderSelected) {
               //     //  return clickManualRunes();
               //    }
               //    // TODO: somehow make it chill. only need to click it once and wait for el to appear again.
               // }
            });

            addObserver(runeSelectorObserver,
               '#lol-uikit-layer-manager-wrapper',
               {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  characterData: true
               },
               'rune-selector-observer');

         } else {
            removeCSS('hideRuneRecommender');
            clearInterval(OBSERVER_INTERVALS['rune-selector-observer']);
            runeSelectorObserver?.disconnect();
            runeSelectorObserver = null;
         }
         await setSetting('hideRuneRecommender', checked);
      }
   }
}

/**
 * generates html elements for settingss
 */
const GENERATORS = {
   checkbox: generateCheckbox,
   button: generateButton,
   select: generateSelect,
   html: generateHTML
}

/**
 * observes when settings panel is opened and adds the cheat settings.
 */
const observer = new MutationObserver(async (mutations) => {
   const panel = document.querySelector(
      'div.lol-settings-options > lol-uikit-scrollable'
   );
   if (
      panel &&
      mutations.find((record) => Array.from(record.addedNodes).includes(panel))
   ) {
      const row = document.createElement('div');
      row.classList.add('lol-settings-general-row');

      const label = document.createElement('p');
      label.classList.add('lol-settings-window-size-text');
      label.textContent = 'Reload Theme';
      label.style.marginBottom = '12px';

      const searchdiv = document.createElement('searchbox-container');
      searchdiv.style.marginBottom = '12px';
      searchdiv.style.display = 'inline-block';

      // create a text field
      const input = document.createElement('lol-uikit-flat-input');
      input.style.marginBottom = '12px';
      const searchbox = document.createElement('input');
      searchbox.type = 'url';
      searchbox.placeholder = 'Theme URL';
      searchbox.style.width = '200px';
      searchbox.name = 'name';

      const btn = document.createElement('lol-uikit-flat-button-secondary');
      btn.style.display = 'flex';
      btn.textContent = 'Reload theme';
      btn.style.marginBottom = '12px';
      btn.onclick = () => {
         location.reload();
         themeReload();
      };

      // if input of searchbox changes wait for 1 second
      // and check if the value is a valid url
      // if it is valid change the root values
      searchbox.oninput = () => {
         setTimeout(() => {
            if (
               searchbox.value.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|jpeg|png)/g
               )
            ) {
               accessThemeCSS(searchbox.value);
               // console.log('valid url');
            } else {
               //console.log('invalid url');
            }
         }, 1000);
      };

      searchdiv.append(input);
      input.append(searchbox);

      row.append(label);
      row.append(btn);
      row.append(input);

      for (const key in CHEATS) {
         try {
            const cheat = CHEATS[key];
            const localStorage = window.localStorage.getItem(key);
            const generated = await GENERATORS[cheat.type](key, cheat, localStorage);
            if (!cheat.description) {
               generated.style.marginBottom = "12px";
            }
            row.append(generated);
            if (cheat.description) {
               const description = generateDescription(cheat.description);
               description.style.marginBottom = "12px";
               row.append(description);
            }
         } catch (e) {
            console.error(e);
         }
      }

      panel.prepend(row);
   }
});

/**
 * idk, sarah
 */
function accessThemeCSS(value) {
   const root = document.documentElement;
   // remove formatting from the url
   // set the root values
   // decode url to get the original url
   root.style.setProperty('--background', `url(${decodeURIComponent(value)})`);

   // ** This part doesnt work. Blame riot. i Have yet to find a way to save stuff in the client **

   // check if the cookie already exists
   // if it does see if the value is the same as the new value
   // if it is not the same change the cookie value
   // if it does not exist create a new cookie
   if (document.cookie.indexOf('background') >= 0) {
      if (document.cookie.indexOf(value) < 0) {
         document.cookie = `background=${value}; expires=Thu, 18 Dec 2022 12:00:00 UTC; path=/`;
      }
   } else {
      document.cookie = `background=${value}; expires=Thu, 18 Dec 2022 12:00:00 UTC; path=/`;
   }

   //console.log('changed background');
   //console.log(decodeURIComponent(value));
}

/**
 * reloads the theme
 */
function themeReload() {
   const style = document.createElement('link');
   style.textContent = require('./theme.css');
   style.type = 'text/css';
   style.rel = 'stylesheet';
   head.append(style);
}

/**
 * injects a <style> element with provided css.
 * 
 * all added stylesheets will be stored in INJECTED_CSS, so they can be removed later based on key.
 * @param {string} key key that will be used to remove the css
 * @param {*} css css to inject
 */
function injectCSS(key, css) {
   const style = document.createElement('style');
   style.textContent = css;
   style.type = 'text/css';
   style.rel = 'stylesheet';
   document.body.append(style);
   INJECTED_CSS[key] = style;
}

/**
 * finds and removes a <style> element based on key.
 * 
 * @param {keyof 'INJECTED_CSS'} key key of the css to remove. must be found in INJECTED_CSS
 */
function removeCSS(key) {
   INJECTED_CSS[key].remove();
   delete INJECTED_CSS[key];
}

/**
 * 
 * @param {keyof CHEATS} key cheat name
 * @returns {boolean} true if cheat is enabled, false if not
 */
function isCheatEnabled(key) {
   return window.localStorage.getItem(key) === 'true';
}

function champSelectStateFunctionality() {
   champSelectInterval = setInterval(() => {
      const bottomRightButtons = document.querySelector(".bottom-right-buttons");
      if (bottomRightButtons) {
         if (dodgeButtonAdded) return clearInterval(champSelectInterval);
         const btn = generateButtonHTML("Dodge", dodgeMatch, false);
         btn.classList.add("ember-view", "quit-button");
         bottomRightButtons.prepend(btn);
         clearInterval(champSelectInterval);
         dodgeButtonAdded = true;
      }
   }, 200);
}

/**
 * on client load, adds a mutation observer for settings panel and injects the theme css.
 */
window.addEventListener('load', async () => {
   let style = document.createElement('style');
   style.textContent = require('./theme.css');
   style.type = 'text/css';
   style.rel = 'stylesheet';
   document.body.append(style);
   console.clear();
   console.log('We injected bois');
   addObserver(observer,
      '#lol-uikit-layer-manager-wrapper',
      {
         attributes: true,
         childList: true,
         subtree: true,
         characterData: true
      },
      'settings-panel-observer');

   // set summoner id if it is null
   SUMMONER_ID ??= await getSummonerID();
   console.log("SUMM ID: ", SUMMONER_ID);
   // get settings from API
   const settings = await getSettings();

   if (settings != undefined) {
      console.log("received settings:", settings)

      for await (const setting of Object.keys(settings)) {
         // dirty fix for settings being synced to localStorage when using API
         // console.log("setting", key, settings[key]);
         window.localStorage.setItem(setting, settings[setting]);
      }
   }
   // run enabled cheats after reload
   for await (const key of Object.keys(CHEATS)) {
      const cheat = CHEATS[key];
      const localStorage = window.localStorage.getItem(key);
      console.log(key, localStorage);
      if (localStorage === 'true') {
         cheat.func(localStorage);
      }
   }

   subscribe_endpoint("/lol-gameflow/v1/gameflow-phase", async (msg) => {
      CLIENT_STATE = JSON.parse(msg.data)[2]["data"];
      console.log("CLIENT STATE IS", CLIENT_STATE);
      if (CLIENT_STATE != "ChampSelect") {
         clearInterval(champSelectInterval);
      }
      if (CLIENT_STATE == "ReadyCheck") {
         if (isCheatEnabled("autoAccept")) {
            await acceptMatchFound();
         }
      } else if (CLIENT_STATE == "ChampSelect") {
         champSelectStateFunctionality();
      } else if (CLIENT_STATE == "PreEndOfGame") {
         if (isCheatEnabled("autoReQeueue")) {
            // auto click OK on chest and level up notifications
            const celebration = document.querySelector(".vignette-celebration");
            if (celebration) {
               celebration.querySelector('lol-uikit-flat-button').shadowRoot.querySelector(".lol-uikit-flat-button-wrapper").click();
            }
         }
      } else if (CLIENT_STATE == "EndOfGame") {
         if (isCheatEnabled("autoReQueue")) {
            await playAgain();
            await startQueue();
         }
      }
   });
});

/**
 * Subscribe to a specific endpoint, and trigger callback function when that endpoint is called
 * @param {string} endpoint Endpoint you wish to monitor. ex: /lol-gameflow/v1/gameflow-phase , send "" to subscribe to all
 * @param {function} callback The callback function
 */

async function subscribe_endpoint(endpoint, callback) {
   const uri = document.querySelector('link[rel="riot:plugins:websocket"]').href
   const ws = new WebSocket(uri, 'wamp')

   ws.onopen = () => ws.send(JSON.stringify([5, 'OnJsonApiEvent' + endpoint.replace(/\//g, '_')]))
   ws.onmessage = callback
}