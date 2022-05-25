import { API_URL, get} from "../api/api";

const RESULTS_PER_PAGE = 5

/**
 * Renders a list of resources/count in a div with id `${id}-list`
 *
 * @param id the prefix of ids of the page (for instance top10, to access "top10-list")
 * @param list the list of `{resource:string, count:number}` to render
 */
export function renderReportList(id, list) {
    const parent = document.getElementById(`${id}-list`);

    // Clear the list
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    // Append resources with the number "count" in front of them
    list.forEach(item => {
        const itemDiv = document.createElement('div');

        const resource = document.createElement('div');
        const count = document.createElement('div');
        resource.innerText = item.resource;
        count.innerText = item.count;

        itemDiv.appendChild(resource);
        itemDiv.appendChild(count);
        parent.appendChild(itemDiv);
    })
}

/**
 * Add all available items from a list of string to a selector with id `stats-period`
 * @param dates
 */
function setPeriodSelector(dates) {
    const periodSelector = document.getElementById('stats-period');

    while (periodSelector.firstChild) {
        periodSelector.removeChild(periodSelector.firstChild);
    }

    if (dates.length === 0)
        periodSelector.style.display = 'none';
    else
        periodSelector.style.display = 'inline-block';

    dates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = date;
        periodSelector.appendChild(option);
    })
}

/**
 * Extract a list of stats from the json 'stats.json', given the selection (periodType, period)
 * @param stats the original json object with all stats
 * @param periodType the selected period type (year, month, week...)
 * @param period the selected period (2021, 2021W33, ...)
 * @returns [{resource:string, count:number}] the list of stats
 */
function getReportList(stats, periodType = null, period = null){
    const periodTypeStats = periodType ? stats[periodType] : stats['years'];
    if(period === null || period >= periodTypeStats.length) return [];
    return periodTypeStats[period]['stats'];
}

/**
 * Render the requested page of the list of stats to `stats-list`, and associated pagination
 * @param stats the selected stats (filtered by period and periodType)
 * @param page the page to render
 */
function renderReportListPaginated(stats, page = 0){
    setPagination(page, stats.length);
    renderReportList('stats', stats.slice(page * RESULTS_PER_PAGE, (page + 1) * RESULTS_PER_PAGE));
}

/**
 * Update the pagination (start, end, total, disabled buttons) according to stats length and current page
 * @param page the currently selected page
 * @param length the total number of results
 */
function setPagination(page, length){
    const previousButton = document.getElementById('stats-controls-previous');
    const nextButton = document.getElementById('stats-controls-next');
    previousButton.disabled = page === 0;
    nextButton.disabled = (page + 1) * RESULTS_PER_PAGE >= length;
    document.getElementById(`stats-controls-start`).innerText = `${page * RESULTS_PER_PAGE + 1}`;
    document.getElementById(`stats-controls-end`).innerText = `${Math.min(length, (page + 1) * RESULTS_PER_PAGE)}`;
    document.getElementById(`stats-controls-total`).innerText = length;
}

/**
 * Main function to init the 2 reports:
 *      - Top 10 requests by period type (year, month, week, day, hour)
 *      - All requests by period type (year, month, week), period (2021, 202108, 2021W33...) and page
 * It attaches callback to controls selection of period type, period and page
 */
export default function initReports() {
    renderReportList('top10', []);
    renderReportList('stats', []);

    // Top ten requests
    get(`${API_URL}topten`, null, (stats) => {
        const periodSelector = document.getElementById('top10-period')
        renderReportList('top10', stats[periodSelector.value]);
        periodSelector.addEventListener('change', (e) => {
            renderReportList('top10', stats[e.target.value]);
        })
    });

    // All requests
    get(`${API_URL}stats`, null, (stats) => {
        // Get controls
        const periodTypeSelector = document.getElementById('stats-period-type')
        const periodSelector = document.getElementById('stats-period')
        const previousButton = document.getElementById('stats-controls-previous')
        const nextButton = document.getElementById('stats-controls-next')

        // Initial selection
        const selection = {
            type: periodTypeSelector.value || 'year',
            period: null,
            page: 0,
            stats: [],
        }

        // On init, select first period of selected period-type, set page 0, and render
        if(stats[selection.type].length > 0) {
            setPeriodSelector(stats[selection.type].map(period => period.date));
            selection.period = 0;
            selection.stats = getReportList(stats, selection.type, selection.period);
            renderReportListPaginated(selection.stats, 0);
        }

        // When period type changes, update list of periods, pagination, and render the first page of first period
        periodTypeSelector.addEventListener('change', (e) => {
            selection.type = e.target.value;
            setPeriodSelector(stats[selection.type].map(period => period.date));
            selection.period = 0;
            selection.page = 0;
            selection.stats = getReportList(stats, selection.type, selection.period);
            renderReportListPaginated(selection.stats, 0);
        })

        // When period changes, render first page of this period
        periodSelector.addEventListener('change', (e) => {
            selection.period = e.target.value;
            selection.page = 0;
            selection.stats = getReportList(stats, selection.type, selection.period);
            renderReportListPaginated(selection.stats, selection.page);
        })

        // When pagination button are clicked, render another page
        previousButton.addEventListener('click', (e) => {
            selection.page = Math.max(0, selection.page - 1);
            renderReportListPaginated(selection.stats, selection.page);
        })
        nextButton.addEventListener('click', (e) => {
            selection.page = selection.page + 1;
            renderReportListPaginated(selection.stats, selection.page);
        })
    });
}