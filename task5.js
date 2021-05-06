const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs");

Urls = "https://www.psychologytoday.com/us/therapists/10956?zipdist=2&fbclid=IwAR2qm-vECbZmDa7SwHG2PyKX2C716zdvkN_hKDN1xAWLL0JmiJYYDM8FDT0";



(async () => {

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto(Urls);


    await page.$("div[class='copyright']");
   
    urls = await page.$$("a[class='result-name']");

    const j2cp = new json2csv();

    let list = [];


    for (let i = 0; i < urls.length; i++) {
        const href = await (await urls[i].getProperty('href')).jsonValue();
        console.log(href);
        await Promise.all([

            page1 = await browser.newPage(),

            page1.goto(href),
            page1.waitForSelector("body > nav.footer-nav > footer > section.footer-extended > div > div.footer-details"),


        ]);


        const result = await page1.$$eval('div[class= "profile-middle profile-flag col-12 col-sm-12 col-md-10 col-lg-10"]', rows => {


            return rows.map(row => {
                const details = {};

                function address_find(row) {
                    var full_address = null;
                    try {
                        const street_address = row.querySelector(' span[itemprop="streetAddress"]');
                        full_address = street_address.innerText.replace(/\s+\++\n/g, ' ').trim();
                    }
                    catch {


                    }

                    const city = row.querySelector(' span[itemprop="addressLocality"]');
                    full_address = full_address + city.innerText;

                    const region = row.querySelector('span[itemprop="addressRegion"]');
                    full_address = full_address + ' ' + region.innerText;

                    const postal_code = row.querySelector('span[itemprop="postalcode"]');
                    full_address = full_address + ' ' + postal_code.innerText;

                    return full_address.replace(/\s+\++\n/g, ' ').trim();

                }

                const name = row.querySelector('h1[itemprop="name"]');
                details.Name = name.innerText.replace(/\s+\++\n/g, ' ').trim();


                details.Address = address_find(row);

                const additional_address = row.querySelector('h2[class="additional-location"]');
                if (additional_address != null) {

                    details.Additional_Address = address_find(row);

                }

                const phone_nubmer_tag = row.querySelector('a[class="phone-number"]');

                details.Phone_Number = phone_nubmer_tag.innerText;

                const insurance_tag = row.querySelector('div[class="spec-list attributes-insurance"]');
                if (insurance_tag != null) {
                    details.Accepted_Insurance = 'True';
                }
                else {
                    details.Accepted_Insurance = 'False';
                }

                return details;

            })




        });

        list.push(result[0]);

    }

    console.log(list);
    // const csv = j2cp.parse(list);
    // fs.appendFileSync("./Info.csv", csv, "utf-8");

    browser.close();

})();