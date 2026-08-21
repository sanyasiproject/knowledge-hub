import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Assign Cookies",
      difficulty: "Easy",
      variation: "Two-list greedy matching",
      link: "https://leetcode.com/problems/assign-cookies/",
      question: [
        "Each child i has a greed factor g[i], and each cookie j has a size s[j]. A child is content if assigned a cookie with size >= greed factor, and each child gets at most one cookie. Return the maximum number of content children.",
        "Example 1:\nInput: g = [1,2,3], s = [1,1]\nOutput: 1\nExample 2:\nInput: g = [1,2], s = [1,2,3]\nOutput: 2",
        "Constraints:\n- 1 <= g.length <= 3 * 10^4\n- 0 <= s.length <= 3 * 10^4\n- 1 <= g[i], s[j] <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());
        int child = 0;
        for (size_t j = 0; j < s.size() && child < (int)g.size(); j++) {
            if (s[j] >= g[child]) child++;
        }
        return child;
    }
};`,
      explanation: [
        "Sort both lists and give each cookie, from smallest up, to the least greedy unsatisfied child it can satisfy.",
        "Exchange argument: if an optimal solution gives a small cookie to a greedier child, swapping it to the less greedy child keeps both assignments valid, so the greedy matching is never worse.",
        "Time: O(n log n + m log m). Space: O(1).",
      ],
    },
    {
      name: "Lemonade Change",
      difficulty: "Easy",
      variation: "Greedy resource spending",
      link: "https://leetcode.com/problems/lemonade-change/",
      question: [
        "Customers pay for a 5-dollar lemonade with a 5, 10, or 20 dollar bill, in order. Starting with no change, return true if you can give every customer correct change.",
        "Example 1:\nInput: bills = [5,5,5,10,20]\nOutput: true\nExample 2:\nInput: bills = [5,5,10,10,20]\nOutput: false",
        "Constraints:\n- 1 <= bills.length <= 10^5\n- bills[i] is 5, 10, or 20",
      ],
      code: `class Solution {
public:
    bool lemonadeChange(vector<int>& bills) {
        int fives = 0, tens = 0;
        for (int b : bills) {
            if (b == 5) {
                fives++;
            } else if (b == 10) {
                if (fives == 0) return false;
                fives--;
                tens++;
            } else {
                if (tens > 0 && fives > 0) {
                    tens--;
                    fives--;
                } else if (fives >= 3) {
                    fives -= 3;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
};`,
      explanation: [
        "For a 20-dollar bill, always prefer paying 10+5 over 5+5+5: tens can only ever be used for twenties, while fives are the universal currency, so hoarding fives dominates every alternative strategy.",
        "That single preference rule is the whole greedy: any solution that breaks a 20 with three fives while holding a ten can be exchanged into the greedy choice without losing feasibility later.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Cost of Ropes",
      difficulty: "Medium",
      variation: "Huffman-style merging",
      link: "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
      question: [
        "Given an array arr of rope lengths, connect all ropes into one. The cost to connect two ropes is the sum of their lengths. Return the minimum total cost to connect all ropes.",
        "Example 1:\nInput: arr = [4,3,2,6]\nOutput: 29\nExplanation: Connect 2+3 = 5 (cost 5), then 5+4 = 9 (cost 9), then 9+6 = 15 (cost 15). Total 29.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= arr[i] <= 10^6",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

long long minCost(vector<long long>& arr) {
    priority_queue<long long, vector<long long>, greater<long long>> pq(arr.begin(), arr.end());
    long long total = 0;
    while (pq.size() > 1) {
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();
        total += a + b;
        pq.push(a + b);
    }
    return total;
}`,
      explanation: [
        "Each rope's length is paid once per merge it participates in, so ropes merged early are paid many times. Always merging the two shortest ropes pushes long ropes to late, cheap positions — exactly Huffman coding's argument.",
        "Exchange argument: in any optimal merge tree, if the two shortest ropes are not siblings at maximum depth, swapping them with deeper ropes never increases the cost, so a greedy-first merge is optimal.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Best Time to Buy and Sell Stock II",
      difficulty: "Medium",
      variation: "Collect every positive delta",
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
      question: [
        "You are given prices where prices[i] is the price of a stock on day i. You may buy and sell any number of times, holding at most one share at a time. Return the maximum profit.",
        "Example 1:\nInput: prices = [7,1,5,3,6,4]\nOutput: 7\nExplanation: Buy at 1 sell at 5 (+4), buy at 3 sell at 6 (+3).",
        "Constraints:\n- 1 <= prices.length <= 3 * 10^4\n- 0 <= prices[i] <= 10^4",
      ],
      code: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int profit = 0;
        for (size_t i = 1; i < prices.size(); i++) {
            if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
        }
        return profit;
    }
};`,
      explanation: [
        "Any trade from day i to day j decomposes into daily steps, and its profit is the sum of those steps. Since we can trade daily, taking every positive one-day step collects the maximum possible sum.",
        "No feasible strategy can exceed the sum of positive deltas (each is the best possible gain for its day), and the greedy achieves that bound exactly.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Jump Game",
      difficulty: "Medium",
      variation: "Furthest reachable point",
      link: "https://leetcode.com/problems/jump-game/",
      question: [
        "Given an array nums where nums[i] is the maximum jump length from index i, starting at index 0, return true if you can reach the last index.",
        "Example 1:\nInput: nums = [2,3,1,1,4]\nOutput: true\nExample 2:\nInput: nums = [3,2,1,0,4]\nOutput: false\nExplanation: Index 3 is a trap: its jump length is 0 and every path lands on it.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^5",
      ],
      code: `class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`,
      explanation: [
        "Maintain the furthest index reachable so far. If the scan ever passes that frontier, index i is unreachable and so is everything after it.",
        "The invariant is that reach is exact: every index <= reach is reachable (jumps of any shorter length are allowed), so tracking only the maximum loses nothing.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Jump Game II",
      difficulty: "Medium",
      variation: "Greedy BFS layers",
      link: "https://leetcode.com/problems/jump-game-ii/",
      question: [
        "Given an array nums where nums[i] is the maximum jump length from index i, return the minimum number of jumps to reach the last index. Test cases guarantee it is reachable.",
        "Example 1:\nInput: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump from 0 to 1, then from 1 to the end.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 1000",
      ],
      code: `class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, currentEnd = 0, furthest = 0;
        for (int i = 0; i + 1 < (int)nums.size(); i++) {
            furthest = max(furthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = furthest;
            }
        }
        return jumps;
    }
};`,
      explanation: [
        "Treat indices reachable in j jumps as BFS layer j: currentEnd is the right edge of the current layer, and furthest accumulates the right edge of the next layer while scanning the current one.",
        "Crossing currentEnd forces one more jump, and expanding to the furthest point is optimal because any index a smaller expansion could later reach is also reachable from the larger frontier.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Two City Scheduling",
      difficulty: "Medium",
      variation: "Sort by cost difference",
      link: "https://leetcode.com/problems/two-city-scheduling/",
      question: [
        "There are 2n people; costs[i] = [aCost_i, bCost_i] is the cost of flying person i to city A or city B. Return the minimum total cost to fly exactly n people to each city.",
        "Example 1:\nInput: costs = [[10,20],[30,200],[400,50],[30,20]]\nOutput: 110\nExplanation: Send persons 0 and 1 to A (10+30) and persons 2 and 3 to B (50+20).",
        "Constraints:\n- 2 <= costs.length <= 100 and costs.length is even\n- 1 <= aCost_i, bCost_i <= 1000",
      ],
      code: `class Solution {
public:
    int twoCitySchedCost(vector<vector<int>>& costs) {
        sort(costs.begin(), costs.end(), [](const vector<int>& x, const vector<int>& y) {
            return x[0] - x[1] < y[0] - y[1];
        });
        int n = costs.size() / 2, total = 0;
        for (int i = 0; i < 2 * n; i++) {
            total += i < n ? costs[i][0] : costs[i][1];
        }
        return total;
    }
};`,
      explanation: [
        "Sort people by aCost - bCost: the more negative the difference, the more is saved by choosing A. Send the first half to A and the rest to B.",
        "Exchange argument: if an optimal solution sends person x to B and person y to A with (xA - xB) < (yA - yB), swapping them changes the cost by (xA - xB) - (yA - yB) <= 0, so sorting by the difference is optimal.",
        "Time: O(n log n). Space: O(1).",
      ],
    },
    {
      name: "Gas Station",
      difficulty: "Medium",
      variation: "Single-pass restart greedy",
      link: "https://leetcode.com/problems/gas-station/",
      question: [
        "There are n gas stations on a circuit; gas[i] is fuel available at station i and cost[i] is fuel needed to travel to station i+1. Return the starting station index from which you can travel the full circuit once clockwise, or -1 if impossible. The answer is guaranteed unique when it exists.",
        "Example 1:\nInput: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= gas[i], cost[i] <= 10^4",
      ],
      code: `class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            int delta = gas[i] - cost[i];
            total += delta;
            tank += delta;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
};`,
      explanation: [
        "If the tank goes negative when starting from s and reaching i, then no station between s and i can be a valid start either — each would enter i with even less fuel. So restart from i+1 with an empty tank.",
        "If the sum of all deltas is non-negative, a valid start must exist, and the last restart point is it: the prefix before it is exactly the deficit that the remaining suffix (with non-negative overall total) can cover.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Hand of Straights",
      difficulty: "Medium",
      variation: "Greedy from the minimum",
      link: "https://leetcode.com/problems/hand-of-straights/",
      question: [
        "Given an array hand of card values and an integer groupSize, return true if the cards can be rearranged into groups of exactly groupSize consecutive values.",
        "Example 1:\nInput: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: true\nExplanation: Groups are [1,2,3], [2,3,4], [6,7,8].\nExample 2:\nInput: hand = [1,2,3,4,5], groupSize = 4\nOutput: false",
        "Constraints:\n- 1 <= hand.length <= 10^4\n- 0 <= hand[i] <= 10^9\n- 1 <= groupSize <= hand.length",
      ],
      code: `class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;
        map<int, int> count;
        for (int c : hand) count[c]++;
        while (!count.empty()) {
            int start = count.begin()->first;
            for (int v = start; v < start + groupSize; v++) {
                auto it = count.find(v);
                if (it == count.end()) return false;
                if (--(it->second) == 0) count.erase(it);
            }
        }
        return true;
    }
};`,
      explanation: [
        "The smallest remaining card must begin some group — nothing smaller exists to precede it — so its group is forced to be start, start+1, ..., start+groupSize-1. Consume those counts and repeat.",
        "Because every step is forced, the greedy fails only when no valid grouping exists at all, which makes it both correct and complete.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Non-overlapping Intervals",
      difficulty: "Medium",
      variation: "Interval scheduling by earliest end",
      link: "https://leetcode.com/problems/non-overlapping-intervals/",
      question: [
        "Given an array of intervals [start, end], return the minimum number of intervals to remove so the remaining intervals do not overlap. Touching endpoints do not overlap.",
        "Example 1:\nInput: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\nExplanation: Remove [1,3]; the rest are non-overlapping.",
        "Constraints:\n- 1 <= intervals.length <= 10^5\n- -5 * 10^4 <= start < end <= 5 * 10^4",
      ],
      code: `class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        int kept = 0, lastEnd = INT_MIN;
        for (auto& iv : intervals) {
            if (iv[0] >= lastEnd) {
                kept++;
                lastEnd = iv[1];
            }
        }
        return (int)intervals.size() - kept;
    }
};`,
      explanation: [
        "Minimizing removals equals maximizing the kept non-overlapping set — classic interval scheduling. Sort by end time and always keep the interval that finishes earliest among compatible ones.",
        "Exchange argument: replacing any chosen interval in an optimal solution with the earliest-ending compatible interval leaves at least as much room for the remainder, so the greedy set is maximum.",
        "Time: O(n log n). Space: O(1).",
      ],
    },
    {
      name: "Minimum Number of Arrows to Burst Balloons",
      difficulty: "Medium",
      variation: "Interval point stabbing",
      link: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
      question: [
        "Balloons are horizontal segments points[i] = [xstart, xend]. An arrow shot straight up at x bursts every balloon with xstart <= x <= xend. Return the minimum number of arrows to burst all balloons.",
        "Example 1:\nInput: points = [[10,16],[2,8],[1,6],[7,12]]\nOutput: 2\nExplanation: Shoot at x = 6 and x = 11.",
        "Constraints:\n- 1 <= points.length <= 10^5\n- -2^31 <= xstart <= xend <= 2^31 - 1",
      ],
      code: `class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        int arrows = 1;
        long long lastShot = points[0][1];
        for (auto& p : points) {
            if (p[0] > lastShot) {
                arrows++;
                lastShot = p[1];
            }
        }
        return arrows;
    }
};`,
      explanation: [
        "Sort by right endpoint and shoot at the first balloon's right edge: that position bursts every balloon overlapping it, and no position bursts more of the balloons that end earliest.",
        "Any solution must use at least one arrow per group of balloons separated by a gap, and the greedy uses exactly one per such group, so it is optimal.",
        "Time: O(n log n). Space: O(1).",
      ],
    },
    {
      name: "Partition Labels",
      difficulty: "Medium",
      variation: "Greedy partition by last occurrence",
      link: "https://leetcode.com/problems/partition-labels/",
      question: [
        "Given a string s, partition it into as many parts as possible so that each letter appears in at most one part, and return the list of part sizes.",
        "Example 1:\nInput: s = \"ababcbacadefegdehijhklij\"\nOutput: [9,7,8]\nExplanation: Parts are \"ababcbaca\", \"defegde\", \"hijhklij\".",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    vector<int> partitionLabels(string s) {
        int last[26];
        for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;
        vector<int> res;
        int start = 0, end = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {
                res.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return res;
    }
};`,
      explanation: [
        "A part containing character c must extend at least to c's last occurrence, so while scanning, keep the running maximum of last occurrences seen; when the scan index reaches that maximum, nothing inside points beyond it and the part can close.",
        "Closing at the earliest legal position maximizes the number of parts, since any later cut merges parts that could have stayed separate.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Merge Triplets to Form Target Triplet",
      difficulty: "Medium",
      variation: "Greedy feasibility filter",
      link: "https://leetcode.com/problems/merge-triplets-to-form-target-triplet/",
      question: [
        "You are given triplets, where each triplet is [a, b, c], and a target triplet. In one operation you may combine two triplets into their element-wise maximum. Return true if the target can be obtained as one of the triplets after any number of operations.",
        "Example 1:\nInput: triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]\nOutput: true\nExample 2:\nInput: triplets = [[3,4,5],[4,5,6]], target = [3,2,5]\nOutput: false",
        "Constraints:\n- 1 <= triplets.length <= 10^5\n- 1 <= values <= 1000",
      ],
      code: `class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        bool haveA = false, haveB = false, haveC = false;
        for (auto& t : triplets) {
            if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
                haveA = haveA || t[0] == target[0];
                haveB = haveB || t[1] == target[1];
                haveC = haveC || t[2] == target[2];
            }
        }
        return haveA && haveB && haveC;
    }
};`,
      explanation: [
        "Taking a max can never lower a coordinate, so any triplet exceeding the target in any position is poison and must be discarded. Among the safe triplets, merging is free — merge them all.",
        "The merged result of all safe triplets hits the target exactly when each coordinate is achieved by at least one safe triplet, which is what the three flags check.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Task Scheduler",
      difficulty: "Medium",
      variation: "Frame counting around the most frequent task",
      link: "https://leetcode.com/problems/task-scheduler/",
      question: [
        "Given a list of CPU tasks (letters A-Z) and a cooldown n, the same task must be at least n intervals apart. Each interval runs one task or idles. Return the minimum number of intervals to finish all tasks.",
        "Example 1:\nInput: tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B.",
        "Constraints:\n- 1 <= tasks.length <= 10^4\n- 0 <= n <= 100",
      ],
      code: `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int freq[26] = {0};
        for (char t : tasks) freq[t - 'A']++;
        int maxFreq = *max_element(freq, freq + 26);
        int maxCount = 0;
        for (int i = 0; i < 26; i++) {
            if (freq[i] == maxFreq) maxCount++;
        }
        int frame = (maxFreq - 1) * (n + 1) + maxCount;
        return max((int)tasks.size(), frame);
    }
};`,
      explanation: [
        "The most frequent task forces a skeleton of maxFreq blocks separated by n slots: (maxFreq-1)*(n+1) intervals plus one final slot for each task tied at maxFreq. Filling other tasks into the gaps never extends this frame until the gaps run out.",
        "If total tasks exceed the frame, the cooldown is never binding — tasks can always be interleaved with no idles — so the answer is the larger of the frame and the task count.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Number of Events That Can Be Attended",
      difficulty: "Medium",
      variation: "Day sweep with earliest deadline first",
      link: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/",
      question: [
        "Given events where events[i] = [startDay, endDay], you can attend one event per day, on any day d with startDay <= d <= endDay. Return the maximum number of events you can attend.",
        "Example 1:\nInput: events = [[1,2],[2,3],[3,4]]\nOutput: 3\nExample 2:\nInput: events = [[1,2],[2,3],[3,4],[1,2]]\nOutput: 4",
        "Constraints:\n- 1 <= events.length <= 10^5\n- 1 <= startDay <= endDay <= 10^5",
      ],
      code: `class Solution {
public:
    int maxEvents(vector<vector<int>>& events) {
        sort(events.begin(), events.end());
        priority_queue<int, vector<int>, greater<int>> ends;
        int i = 0, n = events.size(), attended = 0;
        for (int day = 1; day <= 100000; day++) {
            while (i < n && events[i][0] == day) ends.push(events[i++][1]);
            while (!ends.empty() && ends.top() < day) ends.pop();
            if (!ends.empty()) {
                ends.pop();
                attended++;
            }
            if (ends.empty() && i == n) break;
        }
        return attended;
    }
};`,
      explanation: [
        "Sweep the calendar day by day: open events whose start is today, drop events already expired, and attend the open event with the earliest end — the one in most danger of expiring.",
        "Exchange argument: if an optimal schedule attends a later-ending event today while an earlier-ending open event is skipped, swapping the two keeps the schedule feasible, so earliest-deadline-first is optimal.",
        "Time: O(n log n + D log n) where D is the day range. Space: O(n).",
      ],
    },
    {
      name: "Fractional Knapsack",
      difficulty: "Medium",
      variation: "Ratio-greedy with fractions",
      link: "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
      question: [
        "Given values val[i] and weights wt[i] of n items and a knapsack capacity, maximize the total value in the knapsack. You may take fractions of items.",
        "Example 1:\nInput: val = [60,100,120], wt = [10,20,30], capacity = 50\nOutput: 240.0\nExplanation: Take items 1 and 2 whole, plus two thirds of item 3: 60 + 100 + 80.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= val[i], wt[i] <= 10^4\n- 1 <= capacity <= 2 * 10^5",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

double fractionalKnapsack(vector<int>& val, vector<int>& wt, int capacity) {
    int n = val.size();
    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) {
        return (long long)val[a] * wt[b] > (long long)val[b] * wt[a];
    });
    double total = 0.0;
    int remaining = capacity;
    for (int id : idx) {
        if (remaining <= 0) break;
        int take = min(wt[id], remaining);
        total += (double)val[id] * take / wt[id];
        remaining -= take;
    }
    return total;
}`,
      explanation: [
        "Sort items by value-per-weight ratio (compared via cross-multiplication to avoid floating-point ordering issues) and fill the sack in that order, taking a fraction of the last item if needed.",
        "Because fractions are allowed, any solution carrying weight of a lower-ratio item while higher-ratio weight remains can swap gram for gram and strictly improve — so the ratio order is optimal. (This argument fails for 0/1 knapsack, which needs DP.)",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Job Sequencing Problem",
      difficulty: "Medium",
      variation: "Deadline slots, profit-first",
      link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
      question: [
        "You are given n jobs, each with a deadline and a profit, and every job takes one unit of time. Only one job runs at a time, and a job earns its profit only if completed by its deadline. Return the maximum number of jobs done and the maximum total profit.",
        "Example 1:\nInput: deadline = [4,1,1,1], profit = [20,10,40,30]\nOutput: [2,60]\nExplanation: Do job 3 (profit 40) at time 1 and job 1 (profit 20) by time 4.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= deadline <= n\n- 1 <= profit <= 500",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> jobSequencing(vector<int>& deadline, vector<int>& profit) {
    int n = deadline.size();
    vector<int> idx(n);
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int a, int b) {
        return profit[a] > profit[b];
    });
    int maxD = *max_element(deadline.begin(), deadline.end());
    vector<int> parent(maxD + 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> findSlot = [&](int t) {
        while (parent[t] != t) {
            parent[t] = parent[parent[t]];
            t = parent[t];
        }
        return t;
    };
    int count = 0, total = 0;
    for (int id : idx) {
        int slot = findSlot(deadline[id]);
        if (slot >= 1) {
            parent[slot] = slot - 1;
            count++;
            total += profit[id];
        }
    }
    return {count, total};
}`,
      explanation: [
        "Consider jobs in decreasing profit and schedule each in the latest free slot at or before its deadline; scheduling late keeps earlier slots open for tighter deadlines.",
        "Exchange argument: if an optimal schedule omits the current highest-profit job that still fits, it can drop whichever job occupies that job's slot chain and insert this one without losing more profit than it gains.",
        "A union-find over time slots makes finding the latest free slot near O(1) amortized instead of a linear scan.",
        "Time: O(n log n + n alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Candy",
      difficulty: "Hard",
      variation: "Two-pass constraint greedy",
      link: "https://leetcode.com/problems/candy/",
      question: [
        "There are n children in a line with ratings. Each child gets at least one candy, and any child with a higher rating than an adjacent child must get more candies than that neighbor. Return the minimum total candies.",
        "Example 1:\nInput: ratings = [1,0,2]\nOutput: 5\nExplanation: Give 2, 1, 2 candies.\nExample 2:\nInput: ratings = [1,2,2]\nOutput: 4\nExplanation: Give 1, 2, 1 candies; equal ratings carry no constraint.",
        "Constraints:\n- 1 <= ratings.length <= 2 * 10^4\n- 0 <= ratings[i] <= 2 * 10^4",
      ],
      code: `class Solution {
public:
    int candy(vector<int>& ratings) {
        int n = ratings.size();
        vector<int> candies(n, 1);
        for (int i = 1; i < n; i++) {
            if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
        }
        long long total = 0;
        for (int i = n - 1; i >= 0; i--) {
            if (i + 1 < n && ratings[i] > ratings[i + 1]) {
                candies[i] = max(candies[i], candies[i + 1] + 1);
            }
            total += candies[i];
        }
        return (int)total;
    }
};`,
      explanation: [
        "The constraints decompose by direction: a left-to-right pass satisfies every rising edge minimally, and a right-to-left pass satisfies every falling edge, taking the max so the first pass is not violated.",
        "Minimality holds because each child's count equals 1 plus the length of the strictly decreasing or increasing run forcing it — a lower value would break an adjacent constraint, so no smaller assignment exists.",
        "Time: O(n). Space: O(n).",
      ],
    },
  ],
};
