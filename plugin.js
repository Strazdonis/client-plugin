let cheetosAdded = false;

let autoAcceptObserver;
let acceptInterval;


const generateDescription = (text) => {
   const label = document.createElement('label');
   label.classList.add('lol-settings-ingame-sound-description-text');
   // label.classList.add('description-text');
   label.textContent = text;
   return label;
}

const generateCheckbox = (key, cheat) => {
   const lol_uikit_flat_checkbox = document.createElement('lol-uikit-flat-checkbox');
   lol_uikit_flat_checkbox.setAttribute('for', key);
   const input2 = document.createElement('input');
   input2.slot = 'input';
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

const generateButtonHTML = (name) => {
   const lol_uikit_flat_button = document.createElement('lol-uikit-flat-button-secondary');
   lol_uikit_flat_button.style.display = 'flex';
   lol_uikit_flat_button.style.marginBottom = '12px';
   lol_uikit_flat_button.textContent = name;
   lol_uikit_flat_button.setAttribute('size', 'small');

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

function acceptMatchFound() {
   fetch('/lol-matchmaking/v1/ready-check/accept', {
      method: 'POST'
   })
}

function dodgeMatch() {
   fetch('/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=["","teambuilder-draft","quitV2",""]', {
      method: 'POST'
   });
}

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

async function getFriends() {
   const data = await fetch("/lol-chat/v1/friends");
   const friends = await data.json();
   return friends;
}

async function getHeaders() {
   const response = await fetch('/lol-login/v1/session');
   const session = await response.json();
   const url = response.url;
   //extract port from url
   const port = url.split(':')[2].split('/')[0];
   const accountId = session.accountId;
   const idToken = session.idToken;
   return { port, idToken };
}

async function getToken() {
   const response = await fetch("/lol-rso-auth/v1/authorization/access-token");
   const data = await response.json();
   return data;
}

const CHEATS = {
   autoAccept: {
      name: 'Auto Accept',
      type: 'checkbox',
      func: (checked) => {
         // if(checked) {
         //    autoAcceptObserver = new MutationObserver((mutations) => {
         //       const acceptButton = document.querySelector('.ready-check-button-accept');
         //       if(acceptButton) {
         //          return "YES:)"
         //          acceptButton.click();
         //       }
         //    });
         //    autoAcceptObserver.observe(document.body, {
         //       childList: true,
         //       subtree: true,
         //    });
         // } else {
         //    autoAcceptObserver.disconnect();
         // }
         if (checked) {
            acceptInterval = setInterval(() => {
               fetch('/lol-lobby/v2/lobby/matchmaking/search-state', {
                  method: 'GET',
               }).then((res) => {
                  return res.json();
               }
               ).then((data) => {
                  if (data.searchState === 'Found') {
                     acceptMatchFound();
                  }
               }
               ).catch((err) => {
                  console.log(err);
               }
               );
            }, 1000);
         } else {
            clearInterval(acceptInterval);
         }
      }
   },
   refundLastPurchase: {
      name: 'Refund Last Purchase',
      type: 'button',
      // description: 'Buy a champion, pick it during a game and click this button before the game ends, no refund token will be used to refund it',
      func: async () => {
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
         dodgeMatch();
      }
   },
   multiSearch: {
      name: 'Multi Search',
      description: 'Reveal lobby users',
      type: 'button',
      func: async () => {
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
   // instaGift: {
   //    name: 'Insta Gift',
   //    description: 'Instagift item id to friend',
   //    type: 'html',
   //    html: async () => {
   //       const div = document.createElement('div');
   //       const p = document.createElement('p');
   //       p.classList.add('lol-settings-window-size-text');
   //       p.innerText = 'Instagift';
   //       div.appendChild(p);
   //       const friends = (await getFriends()).filter((friend) => friend.summonerId != 0);
   //       const form = document.createElement('form');
   //       form.appendChild(generateSelectHTML('friend', friends, 'summonerId', 'gameName'));
   //       form.appendChild(generateInputHTML('itemId', 'text', null, 'Item Id'));
   //       const btn = generateButtonHTML('Gift');

   //       form.appendChild(btn);
   //       btn.addEventListener('click', (e) => {
   //          e.preventDefault();
   //          const formData = new FormData(form);
   //          const itemId = formData.get('itemId');
   //          const friendId = formData.get('friend');
   //          CHEATS.instaGift.func(itemId, friendId);
   //       });
   //       div.appendChild(form);
   //       return div;
   //    },
   //    func: async (item, friend) => {
   //       console.log(item, friend);
   //       const storeUrl = await fetch('/lol-store/v1/getStoreUrl').then((res) => {
   //          return res.json();
   //       });
   //       const session = await fetch('/lol-login/v1/session').then((res) => {
   //          return res.json();
   //       });
   //       if (!session) return;
   //       const idToken = session.idToken;
   //       const accountId = session.accountId;
   //       const gift = await fetch(`${storeUrl}/storefront/v3/gift`, {
   //          method: 'POST',
   //          headers: {
   //             'Authorization': `Bearer ${idToken}`,
   //             'Accept': 'application/json',
   //             'Content-Type': 'application/json'
   //          },
   //          body: JSON.stringify({
   //             receiverSummonerId: friend,
   //             giftItemId: "69900831",
   //             accountId: accountId,
   //             items: [{
   //                inventoryType: 'BUNDLES',
   //                itemId: "69900831",
   //                ipCost: null,
   //                rpCost: 250,
   //                quantity: 1
   //             }]
   //          })
   //       }).then((res) => {
   //          return res.json();
   //       });
   //       console.log(gift);
   //    }
   // }
}

const GENERATORS = {
   checkbox: generateCheckbox,
   button: generateButton,
   select: generateSelect,
   html: generateHTML
}

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
            const generated = await GENERATORS[cheat.type](key, cheat);
            console.log(cheat.type, key, generated);
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

function themeReload() {
   var style = document.createElement('link');
   style.textContent = require('./theme.css');
   style.type = 'text/css';
   style.rel = 'stylesheet';
   head.append(style);
}

window.addEventListener('load', () => {
   const interval = setInterval(() => {
      const manager = document.getElementById(
         'lol-uikit-layer-manager-wrapper'
      );
      if (manager) {
         clearInterval(interval);
         observer.observe(manager, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
         });
      }
   }, 500);
   let style = document.createElement('style');
   style.textContent = require('./theme.css');
   style.type = 'text/css';
   style.rel = 'stylesheet';
   document.body.append(style);
   console.clear();
   console.log('We injected bois');
});
