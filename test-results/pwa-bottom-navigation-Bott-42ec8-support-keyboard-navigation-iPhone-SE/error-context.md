# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "Home" [ref=e4]:
        - /url: /
        - img [ref=e6]
        - generic [ref=e9]: Home
      - link "Check-in" [ref=e10]:
        - /url: /checkin
        - img [ref=e12]
        - generic [ref=e16]: Check-in
      - link [ref=e17]:
        - /url: /log
        - img [ref=e19]
      - link "Insights" [ref=e21]:
        - /url: /insights
        - img [ref=e23]
        - generic [ref=e25]: Insights
      - link "Learn" [ref=e26]:
        - /url: /learn
        - img [ref=e28]
        - generic [ref=e30]: Learn
  - main [ref=e32]
  - generic [ref=e38] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e39]:
      - img [ref=e40]
    - generic [ref=e45]:
      - button "Open issues overlay" [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]: "0"
          - generic [ref=e49]: "1"
        - generic [ref=e50]: Issue
      - button "Collapse issues badge" [ref=e51]:
        - img [ref=e52]
  - alert [ref=e54]
```