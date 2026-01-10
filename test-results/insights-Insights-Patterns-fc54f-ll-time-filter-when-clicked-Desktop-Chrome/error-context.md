# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - heading "404" [level=1] [ref=e5]
      - heading "This page could not be found." [level=2] [ref=e7]
  - navigation [ref=e8]:
    - generic [ref=e9]:
      - link "Home" [ref=e10] [cursor=pointer]:
        - /url: /
        - img [ref=e12]
        - generic [ref=e15]: Home
      - link "Check-in" [ref=e16] [cursor=pointer]:
        - /url: /checkin
        - img [ref=e18]
        - generic [ref=e22]: Check-in
      - link [ref=e23] [cursor=pointer]:
        - /url: /log
        - img [ref=e25]
      - link "Insights" [ref=e27] [cursor=pointer]:
        - /url: /insights
        - img [ref=e29]
        - generic [ref=e31]: Insights
      - link "Learn" [ref=e32] [cursor=pointer]:
        - /url: /learn
        - img [ref=e34]
        - generic [ref=e36]: Learn
  - button "Open Next.js Dev Tools" [ref=e42] [cursor=pointer]:
    - img [ref=e43]
  - alert [ref=e46]
```