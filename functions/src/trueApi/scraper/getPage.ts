import { JSDOM } from "jsdom";

import { trueData } from "./data";

export const getPage = async (response: any) => {
  try {
    const dom = new JSDOM(response);
    const doc = dom.window.document;

    const values = Array.from(doc.querySelectorAll(".content-value"));

    const obj: any = new Object();
    const phone_numbers: any[] = [];
    let address: any[] = [];

    values.map((value, index) => {
      if (
        value.querySelector("a")?.getAttribute("data-link-to-more") === "phone"
      ) {
        phone_numbers.push(
          value.textContent
            ?.replace("- Wireless", "")
            .replace("- Landline", "")
            .trim()
        );
      } else if (
        value.querySelector("a")?.getAttribute("data-link-to-more") ===
        "address"
      ) {
        let adr: any = value
          .querySelector("a")
          ?.textContent?.split("\n")
          .filter((text: string) => text && !text.match(/^\s+$/))
          .map((text: string) => text.trim());
        address.push({
          address: adr.join(" "),
          date: value.querySelector("span")?.textContent?.trim()
            ? value.querySelector("span")?.textContent?.trim()
            : null,
        });
      } else {
        let objkey = trueData.find(
          ({ input }: any) =>
            input ===
            value?.parentElement?.parentElement?.parentElement
              ?.querySelector(".content-label.h5")
              ?.textContent?.trim()
        );

        if (objkey) {
          if (objkey.output.length > 0 && objkey.use) {
            obj[`${objkey?.output}`] = value.textContent
              ?.split(",")
              .map((item) => item.trim());
          }
        }
      }
    });
    const data = {
      first_name: doc.querySelector("#personDetails")?.getAttribute("data-fn")
        ? doc.querySelector("#personDetails")?.getAttribute("data-fn")
        : null,
      last_name: doc.querySelector("#personDetails")?.getAttribute("data-ln")
        ? doc.querySelector("#personDetails")?.getAttribute("data-ln")
        : null,
      city: doc.querySelector("#personDetails")?.getAttribute("data-city")
        ? doc.querySelector("#personDetails")?.getAttribute("data-city")
        : null,
      state: doc.querySelector("#personDetails")?.getAttribute("data-state")
        ? doc.querySelector("#personDetails")?.getAttribute("data-state")
        : null,
      age: doc.querySelector("#personDetails")?.getAttribute("data-age")
        ? doc.querySelector("#personDetails")?.getAttribute("data-age")
        : null,
      address,
      phone_numbers,
      ...obj,
    };
    return data;
  } catch (error) {
    console.log(error);

    debugger;
  }
};
