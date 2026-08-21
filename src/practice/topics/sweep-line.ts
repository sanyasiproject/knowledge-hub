import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Maximum Population Year",
      difficulty: "Easy",
      variation: "Difference array over a small range",
      link: "https://leetcode.com/problems/maximum-population-year/",
      question: [
        "You are given a 2D array logs where logs[i] = [birth_i, death_i] indicates the birth and death years of the i-th person. The population of a year x is the number of people alive during x: a person is counted in years [birth_i, death_i - 1]. Return the earliest year with the maximum population.",
        "Example 1:\nInput: logs = [[1993,1999],[2000,2010]]\nOutput: 1993",
        "Constraints:\n- 1 <= logs.length <= 100\n- 1950 <= birth_i < death_i <= 2050",
      ],
      code: `int maximumPopulation(vector<vector<int>>& logs) {
    vector<int> diff(2052, 0);
    for (auto& l : logs) {
        diff[l[0]]++;
        diff[l[1]]--;
    }
    int alive = 0, best = 0, year = 1950;
    for (int y = 1950; y <= 2050; y++) {
        alive += diff[y];
        if (alive > best) {
            best = alive;
            year = y;
        }
    }
    return year;
}`,
      explanation: [
        "Each life is an interval [birth, death); add +1 at the birth year and -1 at the death year in a difference array, then a prefix sum over the fixed year range 1950..2050 yields the population of every year.",
        "Scanning years in increasing order and updating the maximum only on a strict improvement returns the earliest best year.",
        "Time: O(n + Y) where Y = 101 years. Space: O(Y).",
      ],
    },
    {
      name: "Attend All Meetings",
      difficulty: "Easy",
      variation: "Detect any overlap (Meeting Rooms I)",
      link: "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/",
      question: [
        "Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine whether a person can attend all meetings, i.e. whether no two intervals overlap. Touching endpoints (one meeting ends exactly when another starts) do not count as an overlap.",
        "Example 1:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: false\nExplanation: [0,30] overlaps both other meetings.",
        "Example 2:\nInput: intervals = [[7,10],[2,4]]\nOutput: true",
        "Constraints:\n- 0 <= intervals.length <= 10^4\n- 0 <= start_i < end_i <= 10^6",
      ],
      code: `bool canAttendMeetings(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    for (int i = 1; i < (int)intervals.size(); i++) {
        if (intervals[i][0] < intervals[i - 1][1]) return false;
    }
    return true;
}`,
      explanation: [
        "After sorting by start time, any overlap must occur between adjacent intervals: if interval i starts before interval i-1 ends, they collide; otherwise, since starts are non-decreasing, no earlier interval can reach into interval i either.",
        "Time: O(n log n). Space: O(1) extra beyond the sort.",
      ],
    },
    {
      name: "Merge Intervals",
      difficulty: "Medium",
      variation: "Union of intervals",
      link: "https://leetcode.com/problems/merge-intervals/",
      question: [
        "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "Example 1:\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]",
        "Constraints:\n- 1 <= intervals.length <= 10^4\n- 0 <= start_i <= end_i <= 10^4",
      ],
      code: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> res;
    for (auto& in : intervals) {
        if (!res.empty() && in[0] <= res.back()[1]) {
            res.back()[1] = max(res.back()[1], in[1]);
        } else {
            res.push_back(in);
        }
    }
    return res;
}`,
      explanation: [
        "Sort by start. Sweeping left to right, the current interval either begins inside the last merged block (start <= block end) and extends it, or begins after it and opens a new block. Sorting guarantees no later interval can bridge two blocks that were separated.",
        "Time: O(n log n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Insert Interval",
      difficulty: "Medium",
      variation: "Merge a single new interval",
      link: "https://leetcode.com/problems/insert-interval/",
      question: [
        "You are given a sorted array of non-overlapping intervals and a new interval. Insert the new interval so the result is still sorted and non-overlapping, merging where necessary.",
        "Example 1:\nInput: intervals = [[1,3],[6,9]], newInterval = [2,5]\nOutput: [[1,5],[6,9]]",
        "Example 2:\nInput: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]\nOutput: [[1,2],[3,10],[12,16]]",
        "Constraints:\n- 0 <= intervals.length <= 10^4\n- Intervals are sorted by start and non-overlapping\n- 0 <= start <= end <= 10^5",
      ],
      code: `vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
    vector<vector<int>> res;
    int i = 0, n = intervals.size();
    while (i < n && intervals[i][1] < newInterval[0])
        res.push_back(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = min(newInterval[0], intervals[i][0]);
        newInterval[1] = max(newInterval[1], intervals[i][1]);
        i++;
    }
    res.push_back(newInterval);
    while (i < n) res.push_back(intervals[i++]);
    return res;
}`,
      explanation: [
        "Three phases: copy intervals ending strictly before the new one starts, absorb every interval whose start does not exceed the new interval's end by widening the new interval, then copy the rest. Because the input is sorted and disjoint, the absorbed set is a contiguous block.",
        "Time: O(n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Interval List Intersections",
      difficulty: "Medium",
      variation: "Two-pointer intersection of sorted lists",
      link: "https://leetcode.com/problems/interval-list-intersections/",
      question: [
        "You are given two lists of closed intervals, firstList and secondList, each pairwise disjoint and sorted. Return the intersection of these two interval lists.",
        "Example 1:\nInput: firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]\nOutput: [[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]",
        "Constraints:\n- 0 <= firstList.length, secondList.length <= 1000\n- 0 <= start_i < end_i <= 10^9\n- Each list is sorted and internally disjoint",
      ],
      code: `vector<vector<int>> intervalIntersection(vector<vector<int>>& firstList,
                                         vector<vector<int>>& secondList) {
    vector<vector<int>> res;
    int i = 0, j = 0;
    while (i < (int)firstList.size() && j < (int)secondList.size()) {
        int lo = max(firstList[i][0], secondList[j][0]);
        int hi = min(firstList[i][1], secondList[j][1]);
        if (lo <= hi) res.push_back({lo, hi});
        if (firstList[i][1] < secondList[j][1]) i++;
        else j++;
    }
    return res;
}`,
      explanation: [
        "Two pointers walk both sorted lists. The overlap of the current pair is [max(starts), min(ends)], recorded when non-empty. Advance the pointer of the interval that ends first — it cannot intersect anything further in the other list.",
        "Every step advances one pointer, so the sweep is linear in the total number of intervals.",
        "Time: O(m + n). Space: O(m + n) for the output.",
      ],
    },
    {
      name: "Non-overlapping Intervals",
      difficulty: "Medium",
      variation: "Greedy by earliest end (interval scheduling)",
      link: "https://leetcode.com/problems/non-overlapping-intervals/",
      question: [
        "Given an array of intervals, return the minimum number of intervals you need to remove so that the rest are non-overlapping. Intervals that only touch at a point are not considered overlapping.",
        "Example 1:\nInput: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\nExplanation: Removing [1,3] leaves the rest disjoint.",
        "Constraints:\n- 1 <= intervals.length <= 10^5\n- -5 * 10^4 <= start_i < end_i <= 5 * 10^4",
      ],
      code: `int eraseOverlapIntervals(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
    int removed = 0;
    long long lastEnd = LLONG_MIN;
    for (auto& in : intervals) {
        if (in[0] >= lastEnd) lastEnd = in[1];
        else removed++;
    }
    return removed;
}`,
      explanation: [
        "Removing the fewest intervals is equivalent to keeping the most disjoint intervals — the classic activity-selection problem. Sorting by end time and greedily keeping every interval that starts at or after the last kept end is optimal: the earliest-finishing compatible interval never blocks more future choices than any alternative.",
        "The number removed is the total minus the kept count, accumulated directly in the loop.",
        "Time: O(n log n). Space: O(1) extra.",
      ],
    },
    {
      name: "Minimum Number of Arrows to Burst Balloons",
      difficulty: "Medium",
      variation: "Greedy stabbing of intervals",
      link: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
      question: [
        "Balloons are represented as horizontal diameter intervals points[i] = [x_start, x_end]. An arrow shot vertically at position x bursts every balloon with x_start <= x <= x_end. Return the minimum number of arrows needed to burst all balloons.",
        "Example 1:\nInput: points = [[10,16],[2,8],[1,6],[7,12]]\nOutput: 2\nExplanation: Shoot at x = 6 and x = 11.",
        "Constraints:\n- 1 <= points.length <= 10^5\n- -2^31 <= x_start <= x_end <= 2^31 - 1",
      ],
      code: `int findMinArrowShots(vector<vector<int>>& points) {
    sort(points.begin(), points.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
    int arrows = 0;
    long long pos = LLONG_MIN;
    for (auto& p : points) {
        if (arrows == 0 || p[0] > pos) {
            arrows++;
            pos = p[1];
        }
    }
    return arrows;
}`,
      explanation: [
        "Sort by right endpoint and always shoot at the right endpoint of the first unburst balloon. That position bursts every balloon overlapping it, and no other single arrow can cover a superset of those balloons, so the greedy count is minimal.",
        "A balloon needs a new arrow exactly when its start lies strictly beyond the last arrow position. Endpoints touching count as hit, matching the closed-interval condition.",
        "Time: O(n log n). Space: O(1) extra.",
      ],
    },
    {
      name: "Minimum Platforms",
      difficulty: "Medium",
      variation: "Max concurrent intervals (Meeting Rooms II)",
      link: "https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/",
      question: [
        "Given arrival and departure times of all trains that reach a railway station, find the minimum number of platforms required so that no train has to wait. A platform freed at time t cannot be reused by a train arriving at the same time t.",
        "Example 1:\nInput: arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- Times are given as HHMM-style integers with arr[i] <= dep[i]",
      ],
      code: `int findPlatform(vector<int>& arr, vector<int>& dep) {
    sort(arr.begin(), arr.end());
    sort(dep.begin(), dep.end());
    int n = arr.size();
    int i = 0, j = 0, current = 0, best = 0;
    while (i < n) {
        if (arr[i] <= dep[j]) {
            current++;
            i++;
        } else {
            current--;
            j++;
        }
        best = max(best, current);
    }
    return best;
}`,
      explanation: [
        "Sort arrivals and departures independently and sweep them as a merged event timeline: an arrival increments the number of trains present, a departure decrements it. The peak concurrent count is the required platform count — identical to Meeting Rooms II.",
        "Pairing which departure belongs to which train is irrelevant for the maximum overlap, which is why sorting the two arrays separately is valid. Ties (arrival equal to departure) process the arrival first, matching the rule that a platform is not instantly reusable.",
        "Time: O(n log n). Space: O(1) extra.",
      ],
    },
    {
      name: "Car Pooling",
      difficulty: "Medium",
      variation: "Difference array capacity check",
      link: "https://leetcode.com/problems/car-pooling/",
      question: [
        "A car with a given capacity drives east only. You are given trips[i] = [numPassengers, from, to] meaning that many passengers board at kilometer 'from' and leave at kilometer 'to'. Return true if it is possible to complete all trips without ever exceeding capacity.",
        "Example 1:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false",
        "Example 2:\nInput: trips = [[2,1,5],[3,3,7]], capacity = 5\nOutput: true",
        "Constraints:\n- 1 <= trips.length <= 1000\n- 1 <= numPassengers <= 100\n- 0 <= from < to <= 1000\n- 1 <= capacity <= 10^5",
      ],
      code: `bool carPooling(vector<vector<int>>& trips, int capacity) {
    vector<int> diff(1002, 0);
    for (auto& t : trips) {
        diff[t[1]] += t[0];
        diff[t[2]] -= t[0];
    }
    int load = 0;
    for (int i = 0; i <= 1000; i++) {
        load += diff[i];
        if (load > capacity) return false;
    }
    return true;
}`,
      explanation: [
        "Each trip is an interval [from, to) of occupancy. Because coordinates are bounded by 1000, a difference array records +passengers at pickup and -passengers at drop-off, and a prefix-sum sweep reconstructs the load at every kilometer.",
        "Passengers leaving at kilometer x free their seats before pickups at x are checked, which the [from, to) encoding handles automatically.",
        "Time: O(n + M) with M = 1001 positions. Space: O(M).",
      ],
    },
    {
      name: "Corporate Flight Bookings",
      difficulty: "Medium",
      variation: "Range add, point query via difference array",
      link: "https://leetcode.com/problems/corporate-flight-bookings/",
      question: [
        "There are n flights labeled 1 to n. You are given bookings[i] = [first_i, last_i, seats_i], meaning seats_i seats were reserved on every flight from first_i to last_i inclusive. Return an array answer where answer[i] is the total seats reserved for flight i+1.",
        "Example 1:\nInput: bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5\nOutput: [10,55,45,25,25]",
        "Constraints:\n- 1 <= n <= 2 * 10^4\n- 1 <= bookings.length <= 2 * 10^4\n- 1 <= first_i <= last_i <= n\n- 1 <= seats_i <= 10^4",
      ],
      code: `vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
    vector<int> diff(n + 2, 0);
    for (auto& b : bookings) {
        diff[b[0]] += b[2];
        diff[b[1] + 1] -= b[2];
    }
    vector<int> ans(n);
    int run = 0;
    for (int i = 1; i <= n; i++) {
        run += diff[i];
        ans[i - 1] = run;
    }
    return ans;
}`,
      explanation: [
        "Each booking is a range update: add seats at index first and subtract just past index last. After all updates, a single prefix-sum sweep turns the difference array into the per-flight totals.",
        "This converts m range additions from O(m * n) naive work into O(m + n).",
        "Time: O(m + n). Space: O(n).",
      ],
    },
    {
      name: "Count Days Without Meetings",
      difficulty: "Medium",
      variation: "Gap counting after merging",
      link: "https://leetcode.com/problems/count-days-without-meetings/",
      question: [
        "You are given a positive integer days, the total number of days an employee is available (numbered 1 to days), and a 2D array meetings where meetings[i] = [start_i, end_i] is an inclusive busy range. Meetings may overlap. Return the count of days the employee is available but no meeting is scheduled.",
        "Example 1:\nInput: days = 10, meetings = [[5,7],[1,3],[9,10]]\nOutput: 2\nExplanation: Days 4 and 8 are free.",
        "Constraints:\n- 1 <= days <= 10^9\n- 1 <= meetings.length <= 10^5\n- 1 <= start_i <= end_i <= days",
      ],
      code: `int countDays(int days, vector<vector<int>>& meetings) {
    sort(meetings.begin(), meetings.end());
    long long freeDays = 0, reach = 0;
    for (auto& m : meetings) {
        if (m[0] > reach + 1) freeDays += m[0] - reach - 1;
        reach = max(reach, (long long)m[1]);
    }
    freeDays += days - reach;
    return (int)freeDays;
}`,
      explanation: [
        "Sort meetings by start and sweep while tracking 'reach', the last day covered by any meeting seen so far. A meeting starting at least two days past the reach exposes a gap of free days; overlapping or touching meetings simply extend the reach.",
        "The tail after the final reach up to 'days' is also free. Because days can be 10^9, counting gaps (not marking days) is required.",
        "Time: O(n log n). Space: O(1) extra.",
      ],
    },
    {
      name: "Divide Intervals Into Minimum Number of Groups",
      difficulty: "Medium",
      variation: "Max overlap via sorted endpoint sweep",
      link: "https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/",
      question: [
        "Given a 2D array of inclusive intervals, divide the intervals into the minimum number of groups such that no two intervals in the same group intersect (they may not even touch: [1,5] and [5,8] intersect). Return the minimum number of groups.",
        "Example 1:\nInput: intervals = [[5,10],[6,8],[1,5],[2,3],[1,10]]\nOutput: 3",
        "Constraints:\n- 1 <= intervals.length <= 10^5\n- 1 <= left_i <= right_i <= 10^6",
      ],
      code: `int minGroups(vector<vector<int>>& intervals) {
    int n = intervals.size();
    vector<int> starts(n), ends(n);
    for (int i = 0; i < n; i++) {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }
    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());
    int groups = 0, j = 0;
    for (int i = 0; i < n; i++) {
        if (starts[i] > ends[j]) j++;
        else groups++;
    }
    return groups;
}`,
      explanation: [
        "The minimum number of groups equals the maximum number of intervals alive at any single point (each concurrent interval needs its own group, and greedily reusing any group whose last interval already ended achieves that bound).",
        "Sorting starts and ends separately and sweeping: if the next start comes after the earliest unmatched end, an existing group is reused (advance j); otherwise a new group is needed. Inclusive endpoints mean equality still overlaps, hence the strict comparison.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "My Calendar I",
      difficulty: "Medium",
      variation: "Ordered map neighbor check",
      link: "https://leetcode.com/problems/my-calendar-i/",
      question: [
        "Implement a calendar where book(startTime, endTime) adds the half-open event [startTime, endTime) only if it does not double book (intersect an existing event). Return true if the event was added.",
        "Example 1:\nInput: book(10,20), book(15,25), book(20,30)\nOutput: true, false, true\nExplanation: [15,25) collides with [10,20); [20,30) merely touches it.",
        "Constraints:\n- 0 <= startTime < endTime <= 10^9\n- At most 1000 calls to book",
      ],
      code: `class MyCalendar {
    map<int, int> events; // start -> end
public:
    bool book(int startTime, int endTime) {
        auto next = events.lower_bound(startTime);
        if (next != events.end() && next->first < endTime) return false;
        if (next != events.begin() && prev(next)->second > startTime) return false;
        events[startTime] = endTime;
        return true;
    }
};`,
      explanation: [
        "Keep events in an ordered map by start time. Only two neighbors can conflict with a new half-open interval: the first event starting at or after it (conflict if it starts before the new end) and the event just before it (conflict if it ends after the new start).",
        "Because stored events are pairwise disjoint, these two checks are exhaustive.",
        "Time: O(log n) per booking. Space: O(n).",
      ],
    },
    {
      name: "My Calendar II",
      difficulty: "Medium",
      variation: "Tracking pairwise overlap regions",
      link: "https://leetcode.com/problems/my-calendar-ii/",
      question: [
        "Implement a calendar where book(startTime, endTime) adds the half-open event [startTime, endTime) only if it does not cause a triple booking (three events sharing a common point). Double bookings are allowed. Return true if the event was added.",
        "Example 1:\nInput: book(10,20), book(50,60), book(10,40), book(5,15), book(5,10), book(25,55)\nOutput: true, true, true, false, true, true",
        "Constraints:\n- 0 <= startTime < endTime <= 10^9\n- At most 1000 calls to book",
      ],
      code: `class MyCalendarTwo {
    vector<pair<int, int>> booked, overlaps;
public:
    bool book(int startTime, int endTime) {
        for (auto& ov : overlaps) {
            if (startTime < ov.second && ov.first < endTime) return false;
        }
        for (auto& b : booked) {
            if (startTime < b.second && b.first < endTime) {
                overlaps.push_back({max(startTime, b.first), min(endTime, b.second)});
            }
        }
        booked.push_back({startTime, endTime});
        return true;
    }
};`,
      explanation: [
        "Maintain all single bookings plus the list of regions already double booked. A new event causes a triple booking exactly when it intersects any double-booked region, so that is the rejection test.",
        "When accepted, the event's intersections with existing single bookings become new double-booked regions. Two half-open intervals intersect iff each starts before the other ends.",
        "Time: O(n) per booking, O(n^2) total. Space: O(n).",
      ],
    },
    {
      name: "My Calendar III",
      difficulty: "Hard",
      variation: "Event-delta map, running maximum overlap",
      link: "https://leetcode.com/problems/my-calendar-iii/",
      question: [
        "A k-booking happens when k events have a common point. Implement a calendar where book(startTime, endTime) adds the half-open event [startTime, endTime) and returns the maximum k such that a k-booking exists among all events booked so far.",
        "Example 1:\nInput: book(10,20), book(50,60), book(10,40), book(5,15), book(5,10), book(25,55)\nOutput: 1, 1, 2, 3, 3, 3",
        "Constraints:\n- 0 <= startTime < endTime <= 10^9\n- At most 400 calls to book",
      ],
      code: `class MyCalendarThree {
    map<int, int> delta;
public:
    int book(int startTime, int endTime) {
        delta[startTime]++;
        delta[endTime]--;
        int active = 0, best = 0;
        for (auto& [t, d] : delta) {
            active += d;
            best = max(best, active);
        }
        return best;
    }
};`,
      explanation: [
        "Store +1 at each event start and -1 at each event end in an ordered map — a coordinate-compressed difference array. Sweeping the map in key order accumulates the number of active events at every boundary, whose maximum is the largest k-booking.",
        "The map only holds booked endpoints, so the 10^9 coordinate range costs nothing.",
        "Time: O(n log n) insert plus O(n) sweep per call, O(n^2) total. Space: O(n).",
      ],
    },
    {
      name: "Employee Free Time",
      difficulty: "Hard",
      variation: "Gaps in the union of many interval lists",
      question: [
        "You are given a schedule for several employees; each employee has a sorted list of non-overlapping working intervals [start, end). Return the list of finite, positive-length intervals of common free time — times when no employee is working — in sorted order.",
        "Example 1:\nInput: schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]\nOutput: [[3,4]]\nExplanation: Everyone is busy elsewhere except between 3 and 4.",
        "Constraints:\n- 1 <= number of employees, intervals per employee <= 50\n- 0 <= start < end <= 10^8",
      ],
      code: `vector<pair<int, int>> employeeFreeTime(vector<vector<pair<int, int>>>& schedule) {
    vector<pair<int, int>> all;
    for (auto& emp : schedule)
        for (auto& iv : emp) all.push_back(iv);
    sort(all.begin(), all.end());
    vector<pair<int, int>> freeTime;
    int reach = all[0].second;
    for (int i = 1; i < (int)all.size(); i++) {
        if (all[i].first > reach) freeTime.push_back({reach, all[i].first});
        reach = max(reach, all[i].second);
    }
    return freeTime;
}`,
      explanation: [
        "Common free time is exactly the set of gaps in the union of all busy intervals, so employee boundaries are irrelevant: flatten every interval into one list and sort by start.",
        "Sweep with 'reach', the furthest busy endpoint so far; whenever the next interval starts beyond the reach, the gap between them is free for everyone. The result excludes the unbounded ends by construction.",
        "Time: O(N log N) for N total intervals. Space: O(N).",
      ],
    },
    {
      name: "The Skyline Problem",
      difficulty: "Hard",
      variation: "Sweep line with a height multiset",
      link: "https://leetcode.com/problems/the-skyline-problem/",
      question: [
        "Given buildings [left_i, right_i, height_i], return the skyline as a list of key points [x, y] sorted by x, where each key point is the left endpoint of a horizontal segment of the outer contour. The ground level after the last building must terminate with height 0, and consecutive points must not have equal heights.",
        "Example 1:\nInput: buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]\nOutput: [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]",
        "Constraints:\n- 1 <= buildings.length <= 10^4\n- 0 <= left_i < right_i <= 2^31 - 1\n- 1 <= height_i <= 2^31 - 1\n- Buildings are sorted by left_i",
      ],
      code: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    vector<pair<int, int>> events; // {x, -h} = start, {x, h} = end
    for (auto& b : buildings) {
        events.push_back({b[0], -b[2]});
        events.push_back({b[1], b[2]});
    }
    sort(events.begin(), events.end());
    multiset<int> heights = {0};
    vector<vector<int>> res;
    int prevMax = 0;
    for (auto& [x, h] : events) {
        if (h < 0) heights.insert(-h);
        else heights.erase(heights.find(h));
        int curMax = *heights.rbegin();
        if (curMax != prevMax) {
            res.push_back({x, curMax});
            prevMax = curMax;
        }
    }
    return res;
}`,
      explanation: [
        "Turn each building into a start event and an end event, sorted by x. A multiset of active heights (seeded with ground level 0) gives the current skyline height as its maximum; a key point is emitted whenever that maximum changes.",
        "Encoding starts as negative heights makes ties sort correctly: at equal x, taller starts are processed before shorter ones and before any ends, and ends of shorter buildings precede ends of taller ones, preventing spurious zero-width dips.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Rectangle Area II",
      difficulty: "Hard",
      variation: "2D union area via x-slab sweep",
      link: "https://leetcode.com/problems/rectangle-area-ii/",
      question: [
        "You are given axis-aligned rectangles rectangles[i] = [x1, y1, x2, y2]. Return the total area covered by the union of all rectangles, counting overlapping regions once, modulo 10^9 + 7.",
        "Example 1:\nInput: rectangles = [[0,0,2,2],[1,0,2,3],[1,0,3,1]]\nOutput: 6",
        "Constraints:\n- 1 <= rectangles.length <= 200\n- 0 <= x1 < x2 <= 10^9\n- 0 <= y1 < y2 <= 10^9",
      ],
      code: `int rectangleArea(vector<vector<int>>& rectangles) {
    const long long MOD = 1000000007;
    vector<int> xs;
    for (auto& r : rectangles) {
        xs.push_back(r[0]);
        xs.push_back(r[2]);
    }
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    long long area = 0;
    for (int i = 0; i + 1 < (int)xs.size(); i++) {
        long long width = xs[i + 1] - xs[i];
        vector<pair<int, int>> ys;
        for (auto& r : rectangles)
            if (r[0] <= xs[i] && xs[i + 1] <= r[2])
                ys.push_back({r[1], r[3]});
        if (ys.empty()) continue;
        sort(ys.begin(), ys.end());
        long long covered = 0;
        long long curLo = ys[0].first, curHi = ys[0].second;
        for (auto& [y1, y2] : ys) {
            if (y1 > curHi) {
                covered += curHi - curLo;
                curLo = y1;
                curHi = y2;
            } else {
                curHi = max(curHi, (long long)y2);
            }
        }
        covered += curHi - curLo;
        area = (area + width % MOD * (covered % MOD)) % MOD;
    }
    return (int)area;
}`,
      explanation: [
        "Coordinate-compress the x endpoints; between two adjacent x values the set of covering rectangles is constant, so the union inside that vertical slab is (slab width) times (length of the union of the active y-intervals).",
        "The y-union per slab is a standard merge-intervals pass. With n <= 200 there are at most 2n slabs, each scanned in O(n log n).",
        "Time: O(n^2 log n). Space: O(n).",
      ],
    },
  ],
};
