# openzoid, the Clipmaker 3 Open Source Project

[!NOTE]
This is the **archive** branch.
This code was archived entirely by-hand from panzoid.com. The task finished on 2025-02-09.
**The code is still minified**, as it is on the official website. No further modifications will be made to the Panzoid code in this branch. Some other things may change.
**Do not build new features using this branch.** Use the **unminified** branch instead.
Everything is functionally the same as what you can find on panzoid.com.

[!NOTE]
**Anything involving connecting to panzoid.com will not work** here due to CORS blocking.

**Thanks to the team at (panzoid.com)[https://panzoid.com] for creating one of the best (if not the best) web-based video editors available on the Internet right now**, even if it had to be abandoned.

---

## Current issues
- The repository is missing a license. This is a pretty big problem.
- The unminified branch is the most active, but is not the default branch. This is less of a problem.

## What is openzoid?

openzoid is an attempt to:
1. Firstly, make it so that it is possible to **run Panzoid cm3 locally** without going to panzoid.com
2. After this, make Panzoid cm3 less of a pain to use, by **adding quality of life functionality**, such as autosaving

This project also **counts as archival**, as if panzoid.com ever goes down for any reason, or if the Panzoid team ever decides to delete Clipmaker 3 entirely, **one of the strongest web video editors** (that even **runs flawlessly on school Chromebooks**) **could be lost to time.**

An offline version of Panzoid has been desired by a few users, and as far as I can tell, **no public copies exist.**

https://panzoid.com/community/search/85948?q=user%3ARedTubePoop
https://panzoid.com/community/18345

<!--

## How to use

### I want to run this locally

You only need basic knowledge about running web servers, so if you have that, this process should not be difficult.
There are many ways to do this, but this is the one I personally use:

1. Download all the files and start a webserver of your choice.
    - I personally prefer **php** as it is the easiest to set up. Simply navigate to the folder containing this very README file and run:
```sh
php -S localhost:2345
```
(make sure that the port is available, of course)

2. Open a web browser and go to this corresponding URL:
```
localhost:2345/clipmaker.html
```
There is currently no index.html, so you have to go to clipmaker.html to not receive a 404. Of course, make sure that the domain name corresponds to whatever you chose.

3. Clipmaker 3 should now be loaded; you might have to reload the page once or twice if you notice any oddities. Enjoy!

-->

## Important information, or 'Why is some stuff missing?'

When you open Panzoid cm3 from the website, you will be taken to the webpage [panzoid.com/tools/gen3/clipmaker](https://panzoid.com/tools/gen3/clipmaker). **This is not actually where Panzoid cm3 is located**, it is simply a webpage with the Panzoid navbar, some functionality / scripts to run ads, and an [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).

The Panzoid team also has had a history of changing the URL that the navbar's Clipmaker 3 button leads to.

### **The URL for Panzoid cm3 is actually [panzoid.com/legacy/gen3/clipmaker.html](https://panzoid.com/legacy/gen3/clipmaker.html).**

This version is fully functional compared to the iframe-d one, but lacks the navbar, giving you more vertical space to use cm3. The main branch also features the removed ad banner by default. Not like the ad banner showed anything, anyways.

This project therefore aims to mirror the latter **clipmaker.html** instead of the former **tools/gen3/clipmaker**.

<!-- ## Quality of life version

Once archiving cm3 is finished, there will be three versions of openzoid:

1. The original Panzoid cm3 as you would find it from panzoid.com's clipmaker.html -- for archival reasons
2. Panzoid cm3, with unminified JavaScript and a removed ad banner -- for general use purposes, and adding modification, or studying
3. Same as 2. + quality of life features, both from me and the community -- the heart of cm3 Open Source Project.

1 will never change as long as Panzoid cm3 never changes (which it allegedly has not done for at least the past 5 years).
2 will recieve updates only to make the code easier to read, no adding or removing features, no bugfixes.
3 will recieve updates for everything: refactors, bugfixes and more.

There are no plans to archive gen4. I wanted to archive gen3 as it has been abandoned even though it is such a great editor and I refuse to let it remain as abandonware.

-->