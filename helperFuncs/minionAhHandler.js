export async function fetchMinionPrices(minionName = "INFERNO") {
    const BASE_URL = "https://minionah.com/api/internal/search/minions";
    const TAKE = 50;

    const headers = {
        "Referer": "https://minionah.com/",
        "Content-Type": "application/json",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
    };

    const where = JSON.stringify({
        minion: { AND: [{ generator: minionName }, {}] }
    });

    const allMinions = [];
    let skip = 0;

    while (true) {
        const url = new URL(BASE_URL);
        url.searchParams.set("where", where);
        url.searchParams.set("take", TAKE);
        url.searchParams.set("skip", skip);

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Request failed at skip=${skip}: ${response.status}`);
        }

        const data = await response.json();

        if (!data.length) break;

        for(const {minion_id, hasInfusion, hasFreeWill, price, amount} of data){
            allMinions.push({minion_id, hasInfusion, hasFreeWill, price, amount});
        }

        if (data.length < TAKE) break; // last page, no point fetching again

        skip += TAKE;
    }

    return allMinions;
}