//
//No "Promote"
//
// Helper wrapper around Xpath
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function main(evt) {
    // xPath of element to search, in this case button with a text Promite
    const buttonXPath = `//span[text()="Promote"]`;

    // Check for elements to remove every 100 ms
    let jsInitCheckTimer = setInterval (checkForJS_Finish, 100);

    function checkForJS_Finish () {
        if (getElementByXpath(buttonXPath)) {
            // No point in clearing interval, this should allow dynamical delete on page scroll.
            // clearInterval (jsInitCheckTimer);

            // At this point element should be on page
            // Find all the buttons and remove them
            let el = getElementByXpath(buttonXPath);
            while (el) {
                // Remove grand-grand parent element (<a> tag)
                el.parentElement.parentElement.parentElement.remove();
                // Pick next one if exist
                el = getElementByXpath(buttonXPath);
            }
        }
    }
}


document.addEventListener("DOMContentLoaded", main);


//
//Twttr Theming
//

function addStyles(css) {
  var head = document.querySelector("head");
  var style = document.createElement("style");
  style.textContent = `${css}`;
  head.appendChild(style);
}

function showLatestTweets() {
  const run = () => {
    const button = document.querySelector("div[aria-label='Top Tweets on']");
    const home = document.querySelector("a[aria-label='Home']");

    if (button) {
      button.click();
      document.querySelector("div[role='menuitem'][tabindex='0']").click();
    }

    if (home) {
      // Set onclick as well in case they nagivate to a non-home page when first loading the site
      home.onclick = () => {
        setTimeout(showLatestTweets, 50);
      };
    }
  };

  setTimeout(run, 500);
}

chrome.storage.sync.get(
  {
    feedWidth: "700",
    theme: "1",
    showLatest: false,
    centerNavigation: false,
    noTweetButton: false,
    feedBorders: false,
    noBorders: false,
    noNotificationsButton: false,
    noBookmarksButton: false,
    noListsButton: false,
  },
  function (items) {
    if (items.feedWidth === "600") {
      addStyles(`
      div[data-testid="primaryColumn"],
      div[data-testid="primaryColumn"] > div > div,
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(3),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(4),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2) > div > div {
        max-width: 600px !important;
      }
      `);
    } else if (items.feedWidth === "800") {
      addStyles(`
      div[data-testid="primaryColumn"],
      div[data-testid="primaryColumn"] > div > div,
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(3),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(4),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2) > div > div {
        max-width: 800px !important;
      }
      `);
    } else {
      addStyles(`
      div[data-testid="primaryColumn"],
      div[data-testid="primaryColumn"] > div > div,
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(3),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(4),
      div[data-testid="primaryColumn"] > div > div > div:nth-child(2) > div > div {
        max-width: 700px !important;
      }
      `);
    }

//theme selector

//Theme 2
    if (items.theme === "2") {

(function() {
  let settings;
  const isEnglish = (
    document.documentElement.getAttribute("lang") || ""
  ).startsWith("en");
  const state = {
    enforceLatestTweetsDisabledManually: false,
  };

  // Supported features.
  // Can optionally define a test function that must return a boolean.
  const features = {
    singleColumn: {
      default: true,
      init: () => {
        if (state.singleColumn) {
          return noop;
        }
        injectScript(`
          {
            // Don't try this at home.
            const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth')
            Object.defineProperty(window, 'innerWidth', {
              ...originalDescriptor,
               get() {
                const val = originalDescriptor.get.call(window)

                 if (val < 981) {
                   return val
                 }
                 return 981
               }
             })

            Object.defineProperty(window.document.documentElement, 'clientWidth', {
              get() {
                const val = window.innerWidth

                if (val < 981) {
                  return val
                }
                return 981
              }
            })

            window.dispatchEvent(new Event('resize'))
          }
        `);
        state.singleColumn = true;
        return noop;
      },
      styles: [
        `[aria-hidden][data-at-shortcutkeys][style*="min-height"] {
            width: 100%;
            max-width: 691px;
            margin: 0 auto;
          }`,
        `header[role="banner"] { flex: 0 auto }`,
        `main .r-33ulu8 { width: 691px; max-width: 100%; }`,
        `main .r-1ye8kvj { max-width: 100% }`,
      ],
    },
    hideLikeCount: {
      default: false,
      styles: [
        `article [href$="/likes"][href*="/status/"],
         article [data-testid="like"] span,
         article [data-testid="unlike"] span {
            display: none
         }`,
      ],
    },
    hideRetweetCount: {
      default: false,
      styles: [
        `article [href$="/retweets"],
         article [href$="/retweets/with_comments"],
         article [data-testid="retweet"] span,
         article [data-testid="unretweet"] span {
            display: none
         }`,
      ],
    },
    hideReplyCount: {
      default: false,
      styles: [`article [data-testid="reply"] span { display: none }`],
    },
    hideAvatars: {
      default: false,
      styles: [
        `[style*="/profile_images/"] {
          background-image: none !important;
          background-color: #f8f8f8;
        }`,
      ],
    },
    hideExplore: {
      default: false,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return pathname === "/explore";
      },
      styles: [
        `[data-testid="primaryColumn"] [role="region"] { display: none }`,
      ],
    },
    obfuscateHandlesAndUserNames: {
      default: false,
      styles: [
        `[data-testid="tweet"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]),
         [data-testid="UserCell"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]) {
            filter: blur(3px)
         }
        `,
      ],
    },
    hideHandlesAndUserNames: {
      default: false,
      styles: [
        `[data-testid="tweet"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]),
         [data-testid="UserCell"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]) {
            display: none
         }
        `,
      ],
    },
    enforceLatestTweets: {
      default: true,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return (
          pathname === "/home" && !state.enforceLatestTweetsDisabledManually
        );
      },
      init: () => {
        let abort = false;
        let timeElements = [];
        function isShowingLatest() {
          let lastTime = null;
          return isEnglish
            ? document.title.startsWith("Latest")
            : timeElements.every((time) => {
                const currentTime = new Date(time.getAttribute("datetime"));
                const isChronological = !lastTime || lastTime > currentTime;
                lastTime = currentTime;
                return isChronological;
              });
        }
        waitUntil(() => {
          if (abort) {
            throw new Error("aborted");
          }
          const link = document.querySelector('link[href$="twitter.com/home"]');
          const elements = document.querySelectorAll(
            '[data-testid="primaryColumn"] time'
          );
          if (link && elements.length) {
            timeElements = [].slice.call(elements);
            return timeElements;
          }
          return false;
        }, 500)
          .then((timeElements) => {
            if (abort) {
              return;
            }

            if (!isShowingLatest()) {
              waitUntil(() => {
                if (abort) {
                  throw new Error("aborted");
                }
                return document.querySelector(
                  '[data-testid="primaryColumn"] [role="button"]'
                );
              }, 500)
                .then((button) => {
                  button.click();
                  return waitUntil(() => {
                    if (abort) {
                      throw new Error("aborted");
                    }
                    return document.querySelectorAll(
                      '[role="menu"] [role="menuitem"], [role="menu"] [role="button"]'
                    )[0];
                  }, 500);
                })
                .then((switchButton) => {
                  switchButton.click();
                });
            }
          })
          .catch(noop);

        return () => {
          abort = true;
          state.enforceLatestTweetsDisabledManually =
            timeElements.length > 0 && !isShowingLatest();
        };
      },
    },
    oldTwitterFontsStack: {
      default: false,
      styles: [
        `.r-37j5jr {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }`,
      ],
    },
    hideTimelineSpam: {
      default: true,
      test: ({ parsedUrl }) => {
        return (
          /^((?!\/following|\/followers|\/followers_you_follow|\/explore|\/retweets\/without_comments).)*$/.test(
            parsedUrl.pathname
          ) &&
          (!parsedUrl.search || !parsedUrl.search.includes("f=user"))
        );
      },
      styles: [
        `[data-testid="primaryColumn"] a[href^="/i/connect_people"],
         [data-testid="primaryColumn"] [role="region"] [role="heading"]:not([aria-level="1"]),
         [data-testid="primaryColumn"] [role="button"][data-testid="UserCell"],
         [data-testid="primaryColumn"] [role="region"] [href^="/search?q="][href*="&f=user"],
         [href^="/i/related_users"],
         [href="/who_to_follow"] {
            display: none
        }`,
      ],
    },
    enforceAltTextForImages: {
      default: true,
      init: () => {
        const selector = '[data-testid^="tweetButton"]';

        function changeHandler(event) {
          if (!event.target.matches('[data-testid="fileInput"]')) {
            return;
          }
          waitUntil(() => {
            const attachments = Array.from(
              document.querySelectorAll(
                '[data-testid="attachments"] [aria-label]'
              )
            ).filter((e) => e.querySelector("img"));
            if (!attachments.length) {
              return false;
            }
            state.altTextElementPlaceholder = attachments[0].getAttribute(
              "aria-label"
            );
            document.removeEventListener("change", changeHandler);
          }, 500).catch(noop);
        }

        document.addEventListener("change", changeHandler, true);

        function handleEvent(event) {
          btn = parent(event.target, selector);
          if (!btn || btn.getAttribute("aria-disabled") === "true") {
            return;
          }

          btn.addEventListener(
            "click",
            (event) => {
              const attachments = Array.from(
                document.querySelectorAll(
                  '[data-testid="attachments"] [aria-label]'
                )
              ).filter((e) => e.querySelector("img"));

              if (
                state.altTextElementPlaceholder &&
                attachments.some(
                  (a) =>
                    a.getAttribute("aria-label") ===
                    state.altTextElementPlaceholder
                ) &&
                confirm(
                  "Some media do not have a description. Do you want to go back and add one before tweeting?"
                )
              ) {
                event.preventDefault();
                event.stopPropagation();
              }
            },
            { capture: true, once: true }
          );
        }

        document.addEventListener("pointerdown", handleEvent);
        return () => {
          document.removeEventListener("pointerdown", handleEvent);
          document.removeEventListener("change", changeHandler);
        };
      },
    },
    showAltTextForImagesOnHover: {
      default: true,
      styles: [
        `
        [data-testid="tweetPhoto"][aria-label]:hover {
          margin: 0 !important;
          transition: margin 0.2s ease-in-out;
        }
        [data-testid="tweetPhoto"][aria-label]:hover:after {
          content: attr(aria-label);
          position: absolute;
          top: 0;
          background-color: rgba(0, 0, 0, 0.77);
          color: #fff;
          margin: 0.7em;
          padding: 0.2em;
          border-radius: 0.2em;
          font-family: sans-serif;
        }
      `,
      ],
    },
    delayTweet: {
      default: 0,
      init: () => {
        const selector = '[data-testid^="tweetButton"]';
        let lastPointerDownEventTime = Date.now();
        let timeout = null;
        let btn = null;
        let delayBtn = null;
        let tweeting = false;

        function abort() {
          if (timeout) {
            timeout = clearTimeout(timeout);
          }
          if (!btn) {
            return;
          }
          btn.style.display = null;
          if (!delayBtn) {
            return;
          }
          btn.parentNode.removeChild(delayBtn);
          delayBtn = null;
        }
        function handleEvent(event) {
          // When programmatically tweeting.
          if (tweeting || timeout) {
            return;
          }
          btn = parent(event.target, selector);
          if (!btn || btn.getAttribute("aria-disabled") === "true") {
            return;
          }
          lastPointerDownEventTime = Date.now();
          btn.addEventListener(
            "click",
            (event) => {
              // Long press: preserve the default behavior -> tweet
              if (Date.now() - lastPointerDownEventTime > 500) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              delayBtn = btn.cloneNode(true);
              delayBtn.style.backgroundColor = "#ca2055";
              delayBtn.addEventListener("click", abort);
              const delayBtnTextContainer = [].find.call(
                delayBtn.querySelectorAll("*"),
                (node) => node.childNodes[0].nodeType === 3
              );
              btn.style.display = "none";
              btn.parentNode.appendChild(delayBtn);

              let countDown =
                typeof settings.delayTweet !== "number"
                  ? 10
                  : settings.delayTweet;
              function timer() {
                if (countDown === -1) {
                  abort();
                  tweeting = true;
                  btn.click();
                  tweeting = false;
                  btn = null;
                  return;
                }
                if (countDown === 0) {
                  delayBtnTextContainer.textContent = "💥";
                  countDown--;
                } else {
                  delayBtnTextContainer.textContent = isEnglish
                    ? `Abort ${countDown--}`
                    : `🕐 ${countDown--}`;
                }
                timeout = setTimeout(timer, 1000);
              }
              timeout = setTimeout(timer);
            },
            { capture: true, once: true }
          );
        }

        document.addEventListener("pointerdown", handleEvent);
        return () => {
          document.removeEventListener("pointerdown", handleEvent);
          abort();
          tweeting = false;
          btn = null;
        };
      },
    },
    revealHiddenContentOnVKey: {
      default: true,
      init: () => {
        function onKeyDown(event) {
          if (event.key === "v" && !isInputField(event.target)) {
            document.documentElement.setAttribute(
              "data-refined-twitter-lite-shift",
              ""
            );
          }
        }
        function onKeyUp() {
          if (
            document.documentElement.hasAttribute(
              "data-refined-twitter-lite-shift"
            )
          ) {
            document.documentElement.removeAttribute(
              "data-refined-twitter-lite-shift"
            );
          }
        }
        document.documentElement.addEventListener("keydown", onKeyDown);
        document.documentElement.addEventListener("keyup", onKeyUp);
        return () => {
          document.documentElement.removeAttribute(
            "data-refined-twitter-lite-shift"
          );
          document.documentElement.removeEventListener("keydown", onKeyDown);
          document.documentElement.removeEventListener("keyup", onKeyUp);
        };
      },
      affects: new Set([
        "hideAvatars",
        "hideReplyCount",
        "hideRetweetCount",
        "hideLikeCount",
        "hideHandlesAndUserNames",
        "blackAndWhite",
      ]),
    },
    dnd: {
      default: false,
      test: () => {
        if (!Array.isArray(settings.dnd)) {
          return;
        }
        const nowTimestamp = Date.now();
        const [start, end] = settings.dnd.map((time) => {
          const [h, m] = time.split(":").map(Number);
          const t = new Date(nowTimestamp);
          t.setHours(h);
          t.setMinutes(m);
          return t;
        });
        const now = new Date(nowTimestamp);
        return (
          (now >= start || (start >= end && now <= start && now <= end)) &&
          (now <= end || end <= start)
        );
      },
      styles: [
        `[href="/notifications"] [aria-live="polite"], [href="/messages"] [aria-live="polite"] { display: none }`,
        `[href="/notifications"] svg, [href="/messages"] svg { opacity: 0.5 }`,
      ],
    },
    pizza: {
      default: false,
      init: () => {
        let link = null;
        let abort = false;

        waitUntil(() => {
          const navLinks = document.querySelectorAll(
            'header nav[role="navigation"] a'
          );
          if (navLinks.length === 0) {
            return null;
          }
          const navLink = Array.from(navLinks).find(
            (link) =>
              link.textContent.trim() === "" &&
              !link.classList.contains("r-13gxpu9")
          );
          return navLink;
        }, 500)
          .then((navLink) => {
            if (abort) {
              throw new Error("aborted");
            }
            link = navLink.cloneNode(true);
            link.href = "https://www.reddit.com/r/Pizza/new/";
            link.setAttribute("aria-label", "Pizza Subreddit");
            link.classList.add("RefinedTwitterLite-Pizza");
            const svg = link.querySelector("svg");
            svg.setAttribute("viewBox", "0 0 52 52");
            svg.style.width = svg.style.height = "25px";
            svg.style.strokeWidth = "1px";
            svg.style.stroke = "rgb(20, 23, 26)";
            svg.innerHTML =
              '<g><path d="M47.9,29.6C46,14.4,33.5,2,18.4,0.1c-2.5-0.5-4.3,1.2-4.6,3.2c-0.1,0.9,0.2,1.8,0.7,2.6L4,42.8c-0.1,0.3,0,0.7,0.2,0.9   c0.2,0.2,0.6,0.3,0.9,0.2l9-2.6c-0.2,1.1-0.6,2.2-1.1,3.1c-0.5,1-0.7,2.1-0.5,3.1c0.3,2.1,1.9,3.8,4,4.2c3.3,0.7,6.2-1.8,6.2-5   c0-0.7-0.1-1.4-0.4-2.1c-0.8-1.9-1.3-3.6-1.5-5.3l3.5-1c-0.2,0.6-0.3,1.2-0.6,1.9c-0.2,0.6-0.2,1.3-0.1,1.9   c0.3,1.6,1.6,2.8,3.1,3.1c3.1,0.6,5.5-2.5,4.3-5.4c-0.4-1-0.7-2-0.9-3.3l12-3.4c0.9,0.7,2.3,0.8,2.6,0.7   C46.7,33.9,48.4,32,47.9,29.6z M28.9,35.3c-0.4,0.1-0.7,0.5-0.7,1c0.2,1.7,0.6,3.2,1.1,4.5c0.6,1.5-0.6,3.1-2.3,2.8   c-0.8-0.1-1.5-0.8-1.7-1.6c-0.1-0.4,0-0.7,0.1-1c0.4-1.4,0.7-2.5,1-3.6c0.1-0.3,0-0.6-0.3-0.9c-0.2-0.2-0.6-0.3-0.9-0.2l-5.7,1.6   c-0.4,0.1-0.7,0.5-0.7,0.9c0.1,2.1,0.6,4.3,1.7,6.7c0.2,0.4,0.3,0.9,0.3,1.3c0,2-1.9,3.7-4,3.2c-1.3-0.3-2.3-1.4-2.5-2.7   c-0.1-0.7,0-1.4,0.3-2c0.8-1.6,1.3-3.3,1.5-5.2c0-0.3-0.1-0.6-0.3-0.8c-0.2-0.2-0.6-0.3-0.8-0.2l-8.8,2.5l9.8-34.7   c0.3,0.1,0.5,0.2,1,0.3c12.2,1.4,22.1,11.3,23.5,23.5c0,0.3,0.1,0.7,0.3,1L28.9,35.3z M44.5,32.3c-0.9,0.1-1.7-0.4-2-1.4   c0-0.1,0-0.2-0.1-0.3C41,17.6,30.4,7,17.3,5.5c-0.1,0-0.2,0-0.3-0.1c-0.9-0.3-1.4-1.1-1.3-2c0.1-0.9,0.9-1.8,2.4-1.6   c14.3,1.9,26.1,13.6,27.9,28C46.4,31.4,45.4,32.2,44.5,32.3z"/><path d="M32.6,22.8c-2.6,0-4.7,2.1-4.7,4.7s2.1,4.7,4.7,4.7s4.7-2.1,4.7-4.7S35.3,22.8,32.6,22.8z M32.6,30.5   c-1.6,0-2.9-1.3-2.9-2.9c0-1.6,1.3-2.9,2.9-2.9c1.6,0,2.9,1.3,2.9,2.9C35.5,29.2,34.2,30.5,32.6,30.5z"/><path d="M13.5,31c-1.7,0-3,1.4-3,3s1.4,3,3,3s3-1.4,3-3S15.2,31,13.5,31z M13.5,35.2c-0.6,0-1.2-0.5-1.2-1.2s0.5-1.2,1.2-1.2   c0.6,0,1.2,0.5,1.2,1.2S14.2,35.2,13.5,35.2z"/><path d="M17.6,16.1c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5c1.9,0,3.5-1.6,3.5-3.5C21.1,17.7,19.5,16.1,17.6,16.1z    M17.6,21.2c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6c0.9,0,1.6,0.7,1.6,1.6C19.2,20.5,18.5,21.2,17.6,21.2z"/><path d="M18.1,14.3c0.5,0,0.9-0.4,0.9-0.9c0-1.1,0.9-2,2-2c0.5,0,0.9-0.4,0.9-0.9s-0.4-0.9-0.9-0.9c-2.1,0-3.9,1.7-3.9,3.9   C17.2,13.9,17.6,14.3,18.1,14.3z"/><path d="M26,15.8l1.8-0.9c0.5-0.2,0.6-0.8,0.4-1.2c-0.2-0.5-0.8-0.6-1.2-0.4l-1.8,0.9c-0.5,0.2-0.6,0.8-0.4,1.2   C25,15.9,25.5,16.1,26,15.8z"/><path d="M16.5,26.3l-1.8,0.9c-0.5,0.2-0.6,0.8-0.4,1.2c0.2,0.5,0.8,0.6,1.2,0.4l1.8-0.9c0.5-0.2,0.6-0.8,0.4-1.2   C17.5,26.3,16.9,26.1,16.5,26.3z"/><path d="M22.9,29.9c-0.3-0.4-0.9-0.4-1.3-0.1c-0.4,0.3-0.4,0.9-0.1,1.3l1.3,1.6c0.3,0.4,0.9,0.4,1.3,0.1c0.4-0.3,0.4-0.9,0.1-1.3   L22.9,29.9z"/><path d="M28.3,23.3c0.2-0.5-0.1-1-0.5-1.2l-1.9-0.7c-0.5-0.2-1,0.1-1.2,0.5c-0.2,0.5,0.1,1,0.5,1.2l1.9,0.7   C27.6,24,28.1,23.8,28.3,23.3z"/></g>';
            link.addEventListener("click", (event) => {
              event.preventDefault();
              const width = Math.max(screen.width / 4, 500);
              const height = screen.height;
              const left = screen.width - width;
              window.open(
                link.href,
                "Pizza Reddit",
                `width=${width},height=${height},left=${left}`
              );
            });
            const nav = navLink.parentNode;
            nav.insertBefore(link, nav.children[1]);
          })
          .catch(noop);

        return () => {
          abort = true;
          if (link) {
            link.parentNode.removeChild(link);
            link = null;
          }
        };
      },
      styles: [
        `.RefinedTwitterLite-Pizza svg + div { display: none !important }`,
        `.RefinedTwitterLite-Pizza > div { background: none !important }`,
      ],
    },
    likesSearch: {
      default: true,
      test: ({ parsedUrl }) => {
        return (
          (parsedUrl.hostname === "tweetdeck.twitter.com" &&
            parsedUrl.hash === "#ref=rtlLikesSearch") ||
          parsedUrl.pathname.endsWith("/likes")
        );
      },
      init: () => {
        if (window.location.hash !== "#ref=rtlLikesSearch") {
          let link;
          function clickHandler(event) {
            event.preventDefault();
            const width = 400;
            const height = screen.height;
            window.open(
              link.href,
              "Likes Search",
              `width=${width},height=${height * 0.6},top=${height *
                0.2},left=${(screen.width - width) / 2}`
            );
          }
          waitUntil(
            () =>
              document.querySelector('[href="/settings/profile"]') &&
              document.querySelector('section[role="region"]'),
            500
          )
            .then((container) => {
              link = document.createElement("a");
              link.href = "https://tweetdeck.twitter.com/#ref=rtlLikesSearch";
              link.title = "Search Likes";
              link.classList.add("RefinedTwitterLite-likesSearch");
              link.innerHTML = `<svg viewBox="0 0 24 24" class="r-hkyrab r-4qtqp9 r-yyyyoo r-lwhw9o r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>`;
              link.addEventListener("click", clickHandler);
              container.prepend(link);
            })
            .catch(noop);

          return () => {
            link && link.removeEventListener("click", clickHandler);
          };
        }

        waitUntil(() => {
          return Array.from(document.querySelectorAll(".column")).find(
            (c) =>
              c.querySelector(".column-heading").textContent.trim() === "Likes"
          );
        }, 1000).then((column) => {
          column.scrollIntoViewIfNeeded();
          column.querySelector('[data-testid="optionsToggle"]').click();
          const searchBox = Array.from(
            column.querySelectorAll(".js-accordion-toggle-view")
          ).find((i) => i.querySelector(".icon-content"));
          if (searchBox) {
            searchBox.click();
            const searchInput = searchBox.nextElementSibling.querySelector(
              ".js-matching"
            );
            searchInput && searchInput.focus();
          }
        });

        return noop;
      },
      styles: [
        ".app-header { display: none }",
        ".app-content { left: 0 }",
        `.RefinedTwitterLite-likesSearch {
          display: flex;
          padding: 0.5em;
          justify-content: flex-end;
        }`,
      ],
    },
    tryToHideAds: {
      default: true,
      styles: [
        '[data-testid="primaryColumn"] [data-testid="placementTracking"] article { display: none }',
      ],
    },
    strikeThrough: {
      default: true,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return pathname === "/compose/tweet";
      },
      init: () => {
        function toggleStrikeThrough(text) {
          const clean = text.replace(/\u0336/g, "");
          if (clean.length === text.length / 2) {
            return clean;
          }
          return Array.prototype.reduce.call(
            clean,
            (s, c) => (s += c + "\u0336"),
            ""
          );
          window.prompt(
            "",
            Array.prototype.reduce.call(
              window.prompt("Type Something"),
              (s, c) => (s += c + "\u0336"),
              ""
            )
          );
        }
        function onKeyDown(event) {
          if (event.key !== "x" || !event.metaKey || !event.shiftKey) {
            return;
          }
          const selection = window.getSelection();
          if (selection.isCollapsed) {
            return;
          }
          const textContent = selection.anchorNode.textContent;
          selection.anchorNode.textContent =
            textContent.slice(0, selection.anchorOffset) +
            toggleStrikeThrough(
              textContent.slice(selection.anchorOffset, selection.extentOffset)
            ) +
            textContent.slice(selection.extentOffset);
          const keyUpEvent = new Event("change", { bubbles: true });
          selection.anchorNode.parentElement.dispatchEvent(keyUpEvent);
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
          document.removeEventListener("keydown", onKeyDown);
        };
      },
    },
    invertedFollowButtonStyle: {
      default: true,
      styles: [
        `[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) {
            border: 1px solid;
            background-color: transparent !important;
        }`,
        `.r-14lw9ot[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) {
           border-color: white;
        }`,
        `[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) > * {
          filter: invert(1);
        }`,
        `[role="button"][data-testid$="-unfollow"]:not(:hover):not(:focus) {
            backdrop-filter: invert(1);
            border-color: transparent !important;
        }`,
        `[role="button"][data-testid$="-unfollow"]:not(:hover):not(:focus) > * {
          filter: invert(1);
        }`,
      ],
    },
    blackAndWhite: {
      default: false,
      styles: [`body { filter: grayscale(1) }`],
    },
  };

  // Generate and append the styles.
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      ${Object.entries(features)
        .map(([feature, data]) =>
          (data.styles || [])
            .map((rule) => {
              const index = rule.indexOf("{");
              const selectors = rule
                .slice(0, index)
                .trim()
                .split(",")
                .map(
                  (rule) =>
                    (features.revealHiddenContentOnVKey.affects.has(feature)
                      ? "html:not([data-refined-twitter-lite-shift])"
                      : "") +
                    `[data-refined-twitter-lite~="${feature}"] ${rule.trim()}`
                )
                .join(",");

              return selectors + rule.slice(index);
            })
            .join("")
        )
        .join("\n")}
    </style>
  `
  );

  // Settings are saved to localStorage and merged with the default on load.
  const storageKey = "refined-twitter-lite";
  const storedSettings = JSON.parse(localStorage.getItem(storageKey)) || {};
  settings = Object.keys(features).reduce((settings, feature) => {
    if (storedSettings.hasOwnProperty(feature)) {
      settings[feature] = storedSettings[feature];
    } else {
      settings[feature] = features[feature].default;
    }
    return settings;
  }, {});

  let initCleanupFunctions = [];

  function setFeatures(url = window.location.href) {
    initCleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
    initCleanupFunctions = [];

    const parsedUrl = parseUrl(url);

    const enabledFeatures = Object.keys(features).filter(
      (feature) =>
        settings[feature] &&
        (!features[feature].test ||
          features[feature].test({ parsedUrl, title: document.title || "" }))
    );
    document.documentElement.setAttribute(
      "data-refined-twitter-lite",
      enabledFeatures.join(" ")
    );

    // Features can define an init function that is called every time setFeatures is invoked.
    enabledFeatures.forEach((featureName) => {
      const feature = features[featureName];
      if (typeof feature.init === "function") {
        const cleanupFunction = feature.init();
        if (typeof cleanupFunction !== "function") {
          throw new Error(
            "Refined Twitter Lite: the feature.init function must return a cleanup function."
          );
        }
        initCleanupFunctions.push(cleanupFunction);
      }
    });
  }

  // Customize/Save settings API
  // setRefinedTwitterLiteFeatures is available to the user
  // and can be called with the new settings object (can be partial).
  // New settings are merged with the current ones.
  window.setRefinedTwitterLiteFeatures = (features) => {
    settings = Object.assign(settings, features);
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setFeatures();
  };

  const events = {
    setFeatures: setRefinedTwitterLiteFeatures,
    refresh: setFeatures,
  };

  window.addEventListener("RefinedTwitterLite", ({ detail }) => {
    const { type, payload } = detail;
    events[type] && events[type](payload);
  });

  window.addEventListener("beforeunload", () => {
    setRefinedTwitterLiteFeatures(settings);
  });

  window.addEventListener("popstate", () => {
    setFeatures();
  });

  injectScript(`
    window.RefinedTwitterLite = {
      dispatch: (type, payload) => {
        window.dispatchEvent(new CustomEvent('RefinedTwitterLite', {
          detail: {
            type,
            payload
          }
        }))
      }
    }

    RefinedTwitterLite.setFeatures = features => {
      RefinedTwitterLite.dispatch('setFeatures', features)
    }

    RefinedTwitterLite.refresh = url => {
      RefinedTwitterLite.dispatch('refresh', url)
    }

    {
      let prevUrl = window.location.pathname
      const pushState = history.pushState
      history.pushState = function () {
        const url = arguments[2]
        prevUrl !== url && RefinedTwitterLite.refresh(url)
        prevUrl = url
        pushState.apply(history, arguments)
      }
      const replaceState = history.replaceState
      history.replaceState = function () {
        const url = arguments[2]
        prevUrl !== url && RefinedTwitterLite.refresh(url)
        prevUrl = url
        replaceState.apply(history, arguments)
      }
      window.addEventListener('popstate', () => {
        prevUrl = window.location.pathname + window.location.search + window.location.hash
      })
    }
  `);

  setFeatures();

  function injectScript(source) {
    const { nonce } = document.querySelector("script[nonce]") || {};
    const script = document.createElement("script");
    script.nonce = nonce;
    script.textContent = source;
    document.documentElement.appendChild(script);
  }

  function noop() {}
  async function waitUntil(fn, retryTimeout, times = 6) {
    if (times === 0) {
      throw new Error("waitUntil: max retry limit reached");
    }
    const result = fn();
    if (result) {
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, retryTimeout));
    return await waitUntil(fn, retryTimeout, times - 1);
  }
  function isInputField(element) {
    const tagName = element.ownerDocument.activeElement.tagName;
    return (
      element.isContentEditable ||
      tagName == "INPUT" ||
      tagName == "TEXTAREA" ||
      tagName == "SELECT" ||
      tagName == "BUTTON"
    );
  }
  function parseUrl(url) {
    const parsedUrl = document.createElement("a");
    parsedUrl.href = url;
    return parsedUrl;
  }
  function parent(target, selector) {
    if (target.matches(selector)) {
      return target;
    }
    return target.closest(selector);
  }
})();




//Theme 3
    } else if (items.theme === "3") {


const DEFAULT_PREFS = {
  "bt--nofame": {
    value: true,
    label: "No fame: Hide number of followers and following count",
  },
  "bt--nopopularity": {
    value: true,
    label: "No vanity: Hide number of tweet likes, retweets and replies",
  },
  "bt--nopromoted": {
    value: true,
    label: "Hide promoted tweets",
  },
  "bt--noretweets": {
    value: true,
    label: "Hide retweets"
  },
  "bt--nolikedtweets": {
    value: true,
    label: "Hide tweets liked by others"
  },
  "bt--notrends": {
    value: true,
    label: "Hide “Trends for you”",
  },
  "bt--nowtf": {
    value: true,
    label: "Hide “Who to follow”",
  },
  "bt--nofooter": {
    value: true,
    label: "Hide website footer",
  },
}

// Global user prefs in context of the extension content script.
let userPrefs = {};

// Toggle pref IDs as corresponding class names on the <html> element.
// Used by CSS selectors in content.css to tweak the website interface.
function applyPrefs(prefs = {}) {
  userPrefs = { ...DEFAULT_PREFS, ...prefs };
  Object.entries(userPrefs).forEach(([id, pref]) => {
    document.documentElement.classList.toggle(id, pref.value);
  })
}

// Get user prefs and apply their class names to the <html> element
// immediately so the CSS tweaks apply as soon as the DOM is generated.
// Waiting for "DOMContentLoaded" will cause a flash of unwanted content.
chrome.storage.sync.get(['userPrefs'], (result) => {
  applyPrefs(result.userPrefs);
});

// Re-apply user prefs when they're changed.
chrome.storage.onChanged.addListener((changes, area) => {
  const { userPrefs } = changes;
  if (area === "sync" && userPrefs && userPrefs.newValue) {
    applyPrefs(userPrefs.newValue);
  }
});

/*
The new Twitter interface (circa 2019) uses auto-generated markup
with obfuscated class names which are not guaranteed to be stable over time.

In order to remove unwanted parts of the UI when they appear,
we use CSS selectors in the stylesheet (content.css) to identify
areas of interest, then apply a short fake animation to them.

Here in JavaScript, we listen for all `animationstart` events, check if they match
one of the areas of interest (`AnimationEvent.target` points to the element matched
by the CSS seletor), then mark the target element or one of its ancestors. This marker
then causes a CSS selector from content.css to match and hide the intended element.

This is a convoluted but viable workaround for missing ancestor selectors in CSS.
*/
document.addEventListener('animationstart', (e) => {
  switch (e.animationName) {
    case "bt-marker-likedtweet":
    e.target.closest('div:not([class])').setAttribute('bt-likedtweet', true)
      break;
    case "bt-marker-promoted":
    e.target.closest('div:not([class])').setAttribute('bt-promoted', true)
      break;
    case "bt-marker-retweet":
    e.target.closest('div:not([class])').setAttribute('bt-retweet', true)
      break;
    case "bt-marker-wtf-sidebar":
      // Mark the container's parent for the "Who To Follow" in the sidebar.
      e.target.parentNode.classList.add(e.animationName)
      break;
    case "bt-marker-wtf":
      const container = e.target.closest('div:not([class])');
      container.setAttribute('bt-wtf', true);

      // If found, mark the container for the "Who to Follow" heading
      const prevContainer = container.previousElementSibling;
      if (prevContainer.querySelector('h2')) {
        prevContainer.setAttribute('bt-wtf', true);
      }

      // If found, mark the container for "show more" link
      const nextContainer = container.nextElementSibling;
      if (nextContainer.querySelector('[href^="/i/connect_people"]')) {
        nextContainer.setAttribute('bt-wtf', true);
      }
      break;

  }
});



//Theme 4 

    } else if (items.theme === "4") {

(function() {
  let settings;
  const isEnglish = (
    document.documentElement.getAttribute("lang") || ""
  ).startsWith("en");
  const state = {
    enforceLatestTweetsDisabledManually: false,
  };

  // Supported features.
  // Can optionally define a test function that must return a boolean.
  const features = {
    singleColumn: {
      default: true,
      init: () => {
        if (state.singleColumn) {
          return noop;
        }
        injectScript(`
          {
            // Don't try this at home.
            const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth')
            Object.defineProperty(window, 'innerWidth', {
              ...originalDescriptor,
               get() {
                const val = originalDescriptor.get.call(window)

                 if (val < 981) {
                   return val
                 }
                 return 981
               }
             })

            Object.defineProperty(window.document.documentElement, 'clientWidth', {
              get() {
                const val = window.innerWidth

                if (val < 981) {
                  return val
                }
                return 981
              }
            })

            window.dispatchEvent(new Event('resize'))
          }
        `);
        state.singleColumn = true;
        return noop;
      },
      styles: [
        `[aria-hidden][data-at-shortcutkeys][style*="min-height"] {
            width: 100%;
            max-width: 691px;
            margin: 0 auto;
          }`,
        `header[role="banner"] { flex: 0 auto }`,
        `main .r-33ulu8 { width: 691px; max-width: 100%; }`,
        `main .r-1ye8kvj { max-width: 100% }`,
      ],
    },
    hideLikeCount: {
      default: false,
      styles: [
        `article [href$="/likes"][href*="/status/"],
         article [data-testid="like"] span,
         article [data-testid="unlike"] span {
            display: none
         }`,
      ],
    },
    hideRetweetCount: {
      default: false,
      styles: [
        `article [href$="/retweets"],
         article [href$="/retweets/with_comments"],
         article [data-testid="retweet"] span,
         article [data-testid="unretweet"] span {
            display: none
         }`,
      ],
    },
    hideReplyCount: {
      default: false,
      styles: [`article [data-testid="reply"] span { display: none }`],
    },
    hideAvatars: {
      default: false,
      styles: [
        `[style*="/profile_images/"] {
          background-image: none !important;
          background-color: #f8f8f8;
        }`,
      ],
    },
    hideExplore: {
      default: false,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return pathname === "/explore";
      },
      styles: [
        `[data-testid="primaryColumn"] [role="region"] { display: none }`,
      ],
    },
    obfuscateHandlesAndUserNames: {
      default: false,
      styles: [
        `[data-testid="tweet"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]),
         [data-testid="UserCell"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]) {
            filter: blur(3px)
         }
        `,
      ],
    },
    hideHandlesAndUserNames: {
      default: false,
      styles: [
        `[data-testid="tweet"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]),
         [data-testid="UserCell"] [href^="/"]:not([aria-hidden]):not([href*="/status/"]) {
            display: none
         }
        `,
      ],
    },
    enforceLatestTweets: {
      default: true,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return (
          pathname === "/home" && !state.enforceLatestTweetsDisabledManually
        );
      },
      init: () => {
        let abort = false;
        let timeElements = [];
        function isShowingLatest() {
          let lastTime = null;
          return isEnglish
            ? document.title.startsWith("Latest")
            : timeElements.every((time) => {
                const currentTime = new Date(time.getAttribute("datetime"));
                const isChronological = !lastTime || lastTime > currentTime;
                lastTime = currentTime;
                return isChronological;
              });
        }
        waitUntil(() => {
          if (abort) {
            throw new Error("aborted");
          }
          const link = document.querySelector('link[href$="twitter.com/home"]');
          const elements = document.querySelectorAll(
            '[data-testid="primaryColumn"] time'
          );
          if (link && elements.length) {
            timeElements = [].slice.call(elements);
            return timeElements;
          }
          return false;
        }, 500)
          .then((timeElements) => {
            if (abort) {
              return;
            }

            if (!isShowingLatest()) {
              waitUntil(() => {
                if (abort) {
                  throw new Error("aborted");
                }
                return document.querySelector(
                  '[data-testid="primaryColumn"] [role="button"]'
                );
              }, 500)
                .then((button) => {
                  button.click();
                  return waitUntil(() => {
                    if (abort) {
                      throw new Error("aborted");
                    }
                    return document.querySelectorAll(
                      '[role="menu"] [role="menuitem"], [role="menu"] [role="button"]'
                    )[0];
                  }, 500);
                })
                .then((switchButton) => {
                  switchButton.click();
                });
            }
          })
          .catch(noop);

        return () => {
          abort = true;
          state.enforceLatestTweetsDisabledManually =
            timeElements.length > 0 && !isShowingLatest();
        };
      },
    },
    oldTwitterFontsStack: {
      default: false,
      styles: [
        `.r-37j5jr {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }`,
      ],
    },
    hideTimelineSpam: {
      default: true,
      test: ({ parsedUrl }) => {
        return (
          /^((?!\/following|\/followers|\/followers_you_follow|\/explore|\/retweets\/without_comments).)*$/.test(
            parsedUrl.pathname
          ) &&
          (!parsedUrl.search || !parsedUrl.search.includes("f=user"))
        );
      },
      styles: [
        `[data-testid="primaryColumn"] a[href^="/i/connect_people"],
         [data-testid="primaryColumn"] [role="region"] [role="heading"]:not([aria-level="1"]),
         [data-testid="primaryColumn"] [role="button"][data-testid="UserCell"],
         [data-testid="primaryColumn"] [role="region"] [href^="/search?q="][href*="&f=user"],
         [href^="/i/related_users"],
         [href="/who_to_follow"] {
            display: none
        }`,
      ],
    },
    enforceAltTextForImages: {
      default: true,
      init: () => {
        const selector = '[data-testid^="tweetButton"]';

        function changeHandler(event) {
          if (!event.target.matches('[data-testid="fileInput"]')) {
            return;
          }
          waitUntil(() => {
            const attachments = Array.from(
              document.querySelectorAll(
                '[data-testid="attachments"] [aria-label]'
              )
            ).filter((e) => e.querySelector("img"));
            if (!attachments.length) {
              return false;
            }
            state.altTextElementPlaceholder = attachments[0].getAttribute(
              "aria-label"
            );
            document.removeEventListener("change", changeHandler);
          }, 500).catch(noop);
        }

        document.addEventListener("change", changeHandler, true);

        function handleEvent(event) {
          btn = parent(event.target, selector);
          if (!btn || btn.getAttribute("aria-disabled") === "true") {
            return;
          }

          btn.addEventListener(
            "click",
            (event) => {
              const attachments = Array.from(
                document.querySelectorAll(
                  '[data-testid="attachments"] [aria-label]'
                )
              ).filter((e) => e.querySelector("img"));

              if (
                state.altTextElementPlaceholder &&
                attachments.some(
                  (a) =>
                    a.getAttribute("aria-label") ===
                    state.altTextElementPlaceholder
                ) &&
                confirm(
                  "Some media do not have a description. Do you want to go back and add one before tweeting?"
                )
              ) {
                event.preventDefault();
                event.stopPropagation();
              }
            },
            { capture: true, once: true }
          );
        }

        document.addEventListener("pointerdown", handleEvent);
        return () => {
          document.removeEventListener("pointerdown", handleEvent);
          document.removeEventListener("change", changeHandler);
        };
      },
    },
    showAltTextForImagesOnHover: {
      default: true,
      styles: [
        `
        [data-testid="tweetPhoto"][aria-label]:hover {
          margin: 0 !important;
          transition: margin 0.2s ease-in-out;
        }
        [data-testid="tweetPhoto"][aria-label]:hover:after {
          content: attr(aria-label);
          position: absolute;
          top: 0;
          background-color: rgba(0, 0, 0, 0.77);
          color: #fff;
          margin: 0.7em;
          padding: 0.2em;
          border-radius: 0.2em;
          font-family: sans-serif;
        }
      `,
      ],
    },
    delayTweet: {
      default: 0,
      init: () => {
        const selector = '[data-testid^="tweetButton"]';
        let lastPointerDownEventTime = Date.now();
        let timeout = null;
        let btn = null;
        let delayBtn = null;
        let tweeting = false;

        function abort() {
          if (timeout) {
            timeout = clearTimeout(timeout);
          }
          if (!btn) {
            return;
          }
          btn.style.display = null;
          if (!delayBtn) {
            return;
          }
          btn.parentNode.removeChild(delayBtn);
          delayBtn = null;
        }
        function handleEvent(event) {
          // When programmatically tweeting.
          if (tweeting || timeout) {
            return;
          }
          btn = parent(event.target, selector);
          if (!btn || btn.getAttribute("aria-disabled") === "true") {
            return;
          }
          lastPointerDownEventTime = Date.now();
          btn.addEventListener(
            "click",
            (event) => {
              // Long press: preserve the default behavior -> tweet
              if (Date.now() - lastPointerDownEventTime > 500) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              delayBtn = btn.cloneNode(true);
              delayBtn.style.backgroundColor = "#ca2055";
              delayBtn.addEventListener("click", abort);
              const delayBtnTextContainer = [].find.call(
                delayBtn.querySelectorAll("*"),
                (node) => node.childNodes[0].nodeType === 3
              );
              btn.style.display = "none";
              btn.parentNode.appendChild(delayBtn);

              let countDown =
                typeof settings.delayTweet !== "number"
                  ? 10
                  : settings.delayTweet;
              function timer() {
                if (countDown === -1) {
                  abort();
                  tweeting = true;
                  btn.click();
                  tweeting = false;
                  btn = null;
                  return;
                }
                if (countDown === 0) {
                  delayBtnTextContainer.textContent = "💥";
                  countDown--;
                } else {
                  delayBtnTextContainer.textContent = isEnglish
                    ? `Abort ${countDown--}`
                    : `🕐 ${countDown--}`;
                }
                timeout = setTimeout(timer, 1000);
              }
              timeout = setTimeout(timer);
            },
            { capture: true, once: true }
          );
        }

        document.addEventListener("pointerdown", handleEvent);
        return () => {
          document.removeEventListener("pointerdown", handleEvent);
          abort();
          tweeting = false;
          btn = null;
        };
      },
    },
    revealHiddenContentOnVKey: {
      default: true,
      init: () => {
        function onKeyDown(event) {
          if (event.key === "v" && !isInputField(event.target)) {
            document.documentElement.setAttribute(
              "data-refined-twitter-lite-shift",
              ""
            );
          }
        }
        function onKeyUp() {
          if (
            document.documentElement.hasAttribute(
              "data-refined-twitter-lite-shift"
            )
          ) {
            document.documentElement.removeAttribute(
              "data-refined-twitter-lite-shift"
            );
          }
        }
        document.documentElement.addEventListener("keydown", onKeyDown);
        document.documentElement.addEventListener("keyup", onKeyUp);
        return () => {
          document.documentElement.removeAttribute(
            "data-refined-twitter-lite-shift"
          );
          document.documentElement.removeEventListener("keydown", onKeyDown);
          document.documentElement.removeEventListener("keyup", onKeyUp);
        };
      },
      affects: new Set([
        "hideAvatars",
        "hideReplyCount",
        "hideRetweetCount",
        "hideLikeCount",
        "hideHandlesAndUserNames",
        "blackAndWhite",
      ]),
    },
    dnd: {
      default: false,
      test: () => {
        if (!Array.isArray(settings.dnd)) {
          return;
        }
        const nowTimestamp = Date.now();
        const [start, end] = settings.dnd.map((time) => {
          const [h, m] = time.split(":").map(Number);
          const t = new Date(nowTimestamp);
          t.setHours(h);
          t.setMinutes(m);
          return t;
        });
        const now = new Date(nowTimestamp);
        return (
          (now >= start || (start >= end && now <= start && now <= end)) &&
          (now <= end || end <= start)
        );
      },
      styles: [
        `[href="/notifications"] [aria-live="polite"], [href="/messages"] [aria-live="polite"] { display: none }`,
        `[href="/notifications"] svg, [href="/messages"] svg { opacity: 0.5 }`,
      ],
    },
    pizza: {
      default: false,
      init: () => {
        let link = null;
        let abort = false;

        waitUntil(() => {
          const navLinks = document.querySelectorAll(
            'header nav[role="navigation"] a'
          );
          if (navLinks.length === 0) {
            return null;
          }
          const navLink = Array.from(navLinks).find(
            (link) =>
              link.textContent.trim() === "" &&
              !link.classList.contains("r-13gxpu9")
          );
          return navLink;
        }, 500)
          .then((navLink) => {
            if (abort) {
              throw new Error("aborted");
            }
            link = navLink.cloneNode(true);
            link.href = "https://www.reddit.com/r/Pizza/new/";
            link.setAttribute("aria-label", "Pizza Subreddit");
            link.classList.add("RefinedTwitterLite-Pizza");
            const svg = link.querySelector("svg");
            svg.setAttribute("viewBox", "0 0 52 52");
            svg.style.width = svg.style.height = "25px";
            svg.style.strokeWidth = "1px";
            svg.style.stroke = "rgb(20, 23, 26)";
            svg.innerHTML =
              '<g><path d="M47.9,29.6C46,14.4,33.5,2,18.4,0.1c-2.5-0.5-4.3,1.2-4.6,3.2c-0.1,0.9,0.2,1.8,0.7,2.6L4,42.8c-0.1,0.3,0,0.7,0.2,0.9   c0.2,0.2,0.6,0.3,0.9,0.2l9-2.6c-0.2,1.1-0.6,2.2-1.1,3.1c-0.5,1-0.7,2.1-0.5,3.1c0.3,2.1,1.9,3.8,4,4.2c3.3,0.7,6.2-1.8,6.2-5   c0-0.7-0.1-1.4-0.4-2.1c-0.8-1.9-1.3-3.6-1.5-5.3l3.5-1c-0.2,0.6-0.3,1.2-0.6,1.9c-0.2,0.6-0.2,1.3-0.1,1.9   c0.3,1.6,1.6,2.8,3.1,3.1c3.1,0.6,5.5-2.5,4.3-5.4c-0.4-1-0.7-2-0.9-3.3l12-3.4c0.9,0.7,2.3,0.8,2.6,0.7   C46.7,33.9,48.4,32,47.9,29.6z M28.9,35.3c-0.4,0.1-0.7,0.5-0.7,1c0.2,1.7,0.6,3.2,1.1,4.5c0.6,1.5-0.6,3.1-2.3,2.8   c-0.8-0.1-1.5-0.8-1.7-1.6c-0.1-0.4,0-0.7,0.1-1c0.4-1.4,0.7-2.5,1-3.6c0.1-0.3,0-0.6-0.3-0.9c-0.2-0.2-0.6-0.3-0.9-0.2l-5.7,1.6   c-0.4,0.1-0.7,0.5-0.7,0.9c0.1,2.1,0.6,4.3,1.7,6.7c0.2,0.4,0.3,0.9,0.3,1.3c0,2-1.9,3.7-4,3.2c-1.3-0.3-2.3-1.4-2.5-2.7   c-0.1-0.7,0-1.4,0.3-2c0.8-1.6,1.3-3.3,1.5-5.2c0-0.3-0.1-0.6-0.3-0.8c-0.2-0.2-0.6-0.3-0.8-0.2l-8.8,2.5l9.8-34.7   c0.3,0.1,0.5,0.2,1,0.3c12.2,1.4,22.1,11.3,23.5,23.5c0,0.3,0.1,0.7,0.3,1L28.9,35.3z M44.5,32.3c-0.9,0.1-1.7-0.4-2-1.4   c0-0.1,0-0.2-0.1-0.3C41,17.6,30.4,7,17.3,5.5c-0.1,0-0.2,0-0.3-0.1c-0.9-0.3-1.4-1.1-1.3-2c0.1-0.9,0.9-1.8,2.4-1.6   c14.3,1.9,26.1,13.6,27.9,28C46.4,31.4,45.4,32.2,44.5,32.3z"/><path d="M32.6,22.8c-2.6,0-4.7,2.1-4.7,4.7s2.1,4.7,4.7,4.7s4.7-2.1,4.7-4.7S35.3,22.8,32.6,22.8z M32.6,30.5   c-1.6,0-2.9-1.3-2.9-2.9c0-1.6,1.3-2.9,2.9-2.9c1.6,0,2.9,1.3,2.9,2.9C35.5,29.2,34.2,30.5,32.6,30.5z"/><path d="M13.5,31c-1.7,0-3,1.4-3,3s1.4,3,3,3s3-1.4,3-3S15.2,31,13.5,31z M13.5,35.2c-0.6,0-1.2-0.5-1.2-1.2s0.5-1.2,1.2-1.2   c0.6,0,1.2,0.5,1.2,1.2S14.2,35.2,13.5,35.2z"/><path d="M17.6,16.1c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5c1.9,0,3.5-1.6,3.5-3.5C21.1,17.7,19.5,16.1,17.6,16.1z    M17.6,21.2c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6c0.9,0,1.6,0.7,1.6,1.6C19.2,20.5,18.5,21.2,17.6,21.2z"/><path d="M18.1,14.3c0.5,0,0.9-0.4,0.9-0.9c0-1.1,0.9-2,2-2c0.5,0,0.9-0.4,0.9-0.9s-0.4-0.9-0.9-0.9c-2.1,0-3.9,1.7-3.9,3.9   C17.2,13.9,17.6,14.3,18.1,14.3z"/><path d="M26,15.8l1.8-0.9c0.5-0.2,0.6-0.8,0.4-1.2c-0.2-0.5-0.8-0.6-1.2-0.4l-1.8,0.9c-0.5,0.2-0.6,0.8-0.4,1.2   C25,15.9,25.5,16.1,26,15.8z"/><path d="M16.5,26.3l-1.8,0.9c-0.5,0.2-0.6,0.8-0.4,1.2c0.2,0.5,0.8,0.6,1.2,0.4l1.8-0.9c0.5-0.2,0.6-0.8,0.4-1.2   C17.5,26.3,16.9,26.1,16.5,26.3z"/><path d="M22.9,29.9c-0.3-0.4-0.9-0.4-1.3-0.1c-0.4,0.3-0.4,0.9-0.1,1.3l1.3,1.6c0.3,0.4,0.9,0.4,1.3,0.1c0.4-0.3,0.4-0.9,0.1-1.3   L22.9,29.9z"/><path d="M28.3,23.3c0.2-0.5-0.1-1-0.5-1.2l-1.9-0.7c-0.5-0.2-1,0.1-1.2,0.5c-0.2,0.5,0.1,1,0.5,1.2l1.9,0.7   C27.6,24,28.1,23.8,28.3,23.3z"/></g>';
            link.addEventListener("click", (event) => {
              event.preventDefault();
              const width = Math.max(screen.width / 4, 500);
              const height = screen.height;
              const left = screen.width - width;
              window.open(
                link.href,
                "Pizza Reddit",
                `width=${width},height=${height},left=${left}`
              );
            });
            const nav = navLink.parentNode;
            nav.insertBefore(link, nav.children[1]);
          })
          .catch(noop);

        return () => {
          abort = true;
          if (link) {
            link.parentNode.removeChild(link);
            link = null;
          }
        };
      },
      styles: [
        `.RefinedTwitterLite-Pizza svg + div { display: none !important }`,
        `.RefinedTwitterLite-Pizza > div { background: none !important }`,
      ],
    },
    likesSearch: {
      default: true,
      test: ({ parsedUrl }) => {
        return (
          (parsedUrl.hostname === "tweetdeck.twitter.com" &&
            parsedUrl.hash === "#ref=rtlLikesSearch") ||
          parsedUrl.pathname.endsWith("/likes")
        );
      },
      init: () => {
        if (window.location.hash !== "#ref=rtlLikesSearch") {
          let link;
          function clickHandler(event) {
            event.preventDefault();
            const width = 400;
            const height = screen.height;
            window.open(
              link.href,
              "Likes Search",
              `width=${width},height=${height * 0.6},top=${height *
                0.2},left=${(screen.width - width) / 2}`
            );
          }
          waitUntil(
            () =>
              document.querySelector('[href="/settings/profile"]') &&
              document.querySelector('section[role="region"]'),
            500
          )
            .then((container) => {
              link = document.createElement("a");
              link.href = "https://tweetdeck.twitter.com/#ref=rtlLikesSearch";
              link.title = "Search Likes";
              link.classList.add("RefinedTwitterLite-likesSearch");
              link.innerHTML = `<svg viewBox="0 0 24 24" class="r-hkyrab r-4qtqp9 r-yyyyoo r-lwhw9o r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>`;
              link.addEventListener("click", clickHandler);
              container.prepend(link);
            })
            .catch(noop);

          return () => {
            link && link.removeEventListener("click", clickHandler);
          };
        }

        waitUntil(() => {
          return Array.from(document.querySelectorAll(".column")).find(
            (c) =>
              c.querySelector(".column-heading").textContent.trim() === "Likes"
          );
        }, 1000).then((column) => {
          column.scrollIntoViewIfNeeded();
          column.querySelector('[data-testid="optionsToggle"]').click();
          const searchBox = Array.from(
            column.querySelectorAll(".js-accordion-toggle-view")
          ).find((i) => i.querySelector(".icon-content"));
          if (searchBox) {
            searchBox.click();
            const searchInput = searchBox.nextElementSibling.querySelector(
              ".js-matching"
            );
            searchInput && searchInput.focus();
          }
        });

        return noop;
      },
      styles: [
        ".app-header { display: none }",
        ".app-content { left: 0 }",
        `.RefinedTwitterLite-likesSearch {
          display: flex;
          padding: 0.5em;
          justify-content: flex-end;
        }`,
      ],
    },
    tryToHideAds: {
      default: true,
      styles: [
        '[data-testid="primaryColumn"] [data-testid="placementTracking"] article { display: none }',
      ],
    },
    strikeThrough: {
      default: true,
      test: ({ parsedUrl }) => {
        const { pathname } = parsedUrl;
        return pathname === "/compose/tweet";
      },
      init: () => {
        function toggleStrikeThrough(text) {
          const clean = text.replace(/\u0336/g, "");
          if (clean.length === text.length / 2) {
            return clean;
          }
          return Array.prototype.reduce.call(
            clean,
            (s, c) => (s += c + "\u0336"),
            ""
          );
          window.prompt(
            "",
            Array.prototype.reduce.call(
              window.prompt("Type Something"),
              (s, c) => (s += c + "\u0336"),
              ""
            )
          );
        }
        function onKeyDown(event) {
          if (event.key !== "x" || !event.metaKey || !event.shiftKey) {
            return;
          }
          const selection = window.getSelection();
          if (selection.isCollapsed) {
            return;
          }
          const textContent = selection.anchorNode.textContent;
          selection.anchorNode.textContent =
            textContent.slice(0, selection.anchorOffset) +
            toggleStrikeThrough(
              textContent.slice(selection.anchorOffset, selection.extentOffset)
            ) +
            textContent.slice(selection.extentOffset);
          const keyUpEvent = new Event("change", { bubbles: true });
          selection.anchorNode.parentElement.dispatchEvent(keyUpEvent);
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
          document.removeEventListener("keydown", onKeyDown);
        };
      },
    },
    invertedFollowButtonStyle: {
      default: true,
      styles: [
        `[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) {
            border: 1px solid;
            background-color: transparent !important;
        }`,
        `.r-14lw9ot[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) {
           border-color: white;
        }`,
        `[role="button"][data-testid$="-follow"]:not(:hover):not(:focus) > * {
          filter: invert(1);
        }`,
        `[role="button"][data-testid$="-unfollow"]:not(:hover):not(:focus) {
            backdrop-filter: invert(1);
            border-color: transparent !important;
        }`,
        `[role="button"][data-testid$="-unfollow"]:not(:hover):not(:focus) > * {
          filter: invert(1);
        }`,
      ],
    },
    blackAndWhite: {
      default: false,
      styles: [`body { filter: grayscale(1) }`],
    },
  };

  // Generate and append the styles.
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      ${Object.entries(features)
        .map(([feature, data]) =>
          (data.styles || [])
            .map((rule) => {
              const index = rule.indexOf("{");
              const selectors = rule
                .slice(0, index)
                .trim()
                .split(",")
                .map(
                  (rule) =>
                    (features.revealHiddenContentOnVKey.affects.has(feature)
                      ? "html:not([data-refined-twitter-lite-shift])"
                      : "") +
                    `[data-refined-twitter-lite~="${feature}"] ${rule.trim()}`
                )
                .join(",");

              return selectors + rule.slice(index);
            })
            .join("")
        )
        .join("\n")}
    </style>
  `
  );

  // Settings are saved to localStorage and merged with the default on load.
  const storageKey = "refined-twitter-lite";
  const storedSettings = JSON.parse(localStorage.getItem(storageKey)) || {};
  settings = Object.keys(features).reduce((settings, feature) => {
    if (storedSettings.hasOwnProperty(feature)) {
      settings[feature] = storedSettings[feature];
    } else {
      settings[feature] = features[feature].default;
    }
    return settings;
  }, {});

  let initCleanupFunctions = [];

  function setFeatures(url = window.location.href) {
    initCleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
    initCleanupFunctions = [];

    const parsedUrl = parseUrl(url);

    const enabledFeatures = Object.keys(features).filter(
      (feature) =>
        settings[feature] &&
        (!features[feature].test ||
          features[feature].test({ parsedUrl, title: document.title || "" }))
    );
    document.documentElement.setAttribute(
      "data-refined-twitter-lite",
      enabledFeatures.join(" ")
    );

    // Features can define an init function that is called every time setFeatures is invoked.
    enabledFeatures.forEach((featureName) => {
      const feature = features[featureName];
      if (typeof feature.init === "function") {
        const cleanupFunction = feature.init();
        if (typeof cleanupFunction !== "function") {
          throw new Error(
            "Refined Twitter Lite: the feature.init function must return a cleanup function."
          );
        }
        initCleanupFunctions.push(cleanupFunction);
      }
    });
  }

  // Customize/Save settings API
  // setRefinedTwitterLiteFeatures is available to the user
  // and can be called with the new settings object (can be partial).
  // New settings are merged with the current ones.
  window.setRefinedTwitterLiteFeatures = (features) => {
    settings = Object.assign(settings, features);
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setFeatures();
  };

  const events = {
    setFeatures: setRefinedTwitterLiteFeatures,
    refresh: setFeatures,
  };

  window.addEventListener("RefinedTwitterLite", ({ detail }) => {
    const { type, payload } = detail;
    events[type] && events[type](payload);
  });

  window.addEventListener("beforeunload", () => {
    setRefinedTwitterLiteFeatures(settings);
  });

  window.addEventListener("popstate", () => {
    setFeatures();
  });

  injectScript(`
    window.RefinedTwitterLite = {
      dispatch: (type, payload) => {
        window.dispatchEvent(new CustomEvent('RefinedTwitterLite', {
          detail: {
            type,
            payload
          }
        }))
      }
    }

    RefinedTwitterLite.setFeatures = features => {
      RefinedTwitterLite.dispatch('setFeatures', features)
    }

    RefinedTwitterLite.refresh = url => {
      RefinedTwitterLite.dispatch('refresh', url)
    }

    {
      let prevUrl = window.location.pathname
      const pushState = history.pushState
      history.pushState = function () {
        const url = arguments[2]
        prevUrl !== url && RefinedTwitterLite.refresh(url)
        prevUrl = url
        pushState.apply(history, arguments)
      }
      const replaceState = history.replaceState
      history.replaceState = function () {
        const url = arguments[2]
        prevUrl !== url && RefinedTwitterLite.refresh(url)
        prevUrl = url
        replaceState.apply(history, arguments)
      }
      window.addEventListener('popstate', () => {
        prevUrl = window.location.pathname + window.location.search + window.location.hash
      })
    }
  `);

  setFeatures();

  function injectScript(source) {
    const { nonce } = document.querySelector("script[nonce]") || {};
    const script = document.createElement("script");
    script.nonce = nonce;
    script.textContent = source;
    document.documentElement.appendChild(script);
  }

  function noop() {}
  async function waitUntil(fn, retryTimeout, times = 6) {
    if (times === 0) {
      throw new Error("waitUntil: max retry limit reached");
    }
    const result = fn();
    if (result) {
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, retryTimeout));
    return await waitUntil(fn, retryTimeout, times - 1);
  }
  function isInputField(element) {
    const tagName = element.ownerDocument.activeElement.tagName;
    return (
      element.isContentEditable ||
      tagName == "INPUT" ||
      tagName == "TEXTAREA" ||
      tagName == "SELECT" ||
      tagName == "BUTTON"
    );
  }
  function parseUrl(url) {
    const parsedUrl = document.createElement("a");
    parsedUrl.href = url;
    return parsedUrl;
  }
  function parent(target, selector) {
    if (target.matches(selector)) {
      return target;
    }
    return target.closest(selector);
  }
})();

const DEFAULT_PREFS = {
  "bt--nofame": {
    value: true,
    label: "No fame: Hide number of followers and following count",
  },
  "bt--nopopularity": {
    value: true,
    label: "No vanity: Hide number of tweet likes, retweets and replies",
  },
  "bt--nopromoted": {
    value: true,
    label: "Hide promoted tweets",
  },
  "bt--noretweets": {
    value: true,
    label: "Hide retweets"
  },
  "bt--nolikedtweets": {
    value: true,
    label: "Hide tweets liked by others"
  },
  "bt--notrends": {
    value: true,
    label: "Hide “Trends for you”",
  },
  "bt--nowtf": {
    value: true,
    label: "Hide “Who to follow”",
  },
  "bt--nofooter": {
    value: true,
    label: "Hide website footer",
  },
}

// Global user prefs in context of the extension content script.
let userPrefs = {};

// Toggle pref IDs as corresponding class names on the <html> element.
// Used by CSS selectors in content.css to tweak the website interface.
function applyPrefs(prefs = {}) {
  userPrefs = { ...DEFAULT_PREFS, ...prefs };
  Object.entries(userPrefs).forEach(([id, pref]) => {
    document.documentElement.classList.toggle(id, pref.value);
  })
}

// Get user prefs and apply their class names to the <html> element
// immediately so the CSS tweaks apply as soon as the DOM is generated.
// Waiting for "DOMContentLoaded" will cause a flash of unwanted content.
chrome.storage.sync.get(['userPrefs'], (result) => {
  applyPrefs(result.userPrefs);
});

// Re-apply user prefs when they're changed.
chrome.storage.onChanged.addListener((changes, area) => {
  const { userPrefs } = changes;
  if (area === "sync" && userPrefs && userPrefs.newValue) {
    applyPrefs(userPrefs.newValue);
  }
});

document.addEventListener('animationstart', (e) => {
  switch (e.animationName) {
    case "bt-marker-likedtweet":
    e.target.closest('div:not([class])').setAttribute('bt-likedtweet', true)
      break;
    case "bt-marker-promoted":
    e.target.closest('div:not([class])').setAttribute('bt-promoted', true)
      break;
    case "bt-marker-retweet":
    e.target.closest('div:not([class])').setAttribute('bt-retweet', true)
      break;
    case "bt-marker-wtf-sidebar":
      // Mark the container's parent for the "Who To Follow" in the sidebar.
      e.target.parentNode.classList.add(e.animationName)
      break;
    case "bt-marker-wtf":
      const container = e.target.closest('div:not([class])');
      container.setAttribute('bt-wtf', true);

      // If found, mark the container for the "Who to Follow" heading
      const prevContainer = container.previousElementSibling;
      if (prevContainer.querySelector('h2')) {
        prevContainer.setAttribute('bt-wtf', true);
      }

      // If found, mark the container for "show more" link
      const nextContainer = container.nextElementSibling;
      if (nextContainer.querySelector('[href^="/i/connect_people"]')) {
        nextContainer.setAttribute('bt-wtf', true);
      }
      break;

  }
});



//Default Theme

    } else {
      addStyles(`
      `);
    }








//ShowLatest
    if (items.showLatest === true) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showLatestTweets);
      } else {
        showLatestTweets();
      }
    }

//CenterNavigationBar
    if (items.centerNavigation === true) {
      addStyles(`
      header[role="banner"] > div > div > div {
        justify-content: center !important;
        padding-top: 0;
      }
      `);
    }

//NoTweetButton
    if (items.noTweetButton === true) {
      addStyles(`
      a[aria-label="Tweet"][role="link"] {
        display: none !important;
      }
      `);
    }

//MinimizeFeedBorders
    if (items.feedBorders === true) {
      addStyles(`
      div[data-testid="primaryColumn"] {
        border-left-width: 1px !important;
        border-right-width: 1px !important;
      }
      `);
    }

    if (items.noBorders === true) {
      addStyles(`
      div[aria-label="Timeline: Your Home Timeline"] > div > div > div,
      div[aria-label="Timeline: Your Home Timeline"] > div > div > div > div {
        border-bottom-color: transparent;
      }

      div[aria-label="Timeline: Explore"] > div > div > div,
      div[aria-label="Timeline: Explore"] > div > div > div > div {
        border-bottom-color: transparent;
      }
      `);
    }

    if (items.noNotificationsButton === true) {
      addStyles(`a[data-testid="AppTabBar_Notifications_Link"] {
        display: none !important;
      }`);
    }

    if (items.noBookmarksButton === true) {
      addStyles(`header > div > div > div > div > div:nth-child(2) > nav > a:nth-child(5) {
        display: none !important;
      }`);
    }

    if (items.noListsButton === true) {
      addStyles(`header > div > div > div > div > div:nth-child(2) > nav > a:nth-child(6) {
        display: none !important;
      }`);
    }
  }
);
