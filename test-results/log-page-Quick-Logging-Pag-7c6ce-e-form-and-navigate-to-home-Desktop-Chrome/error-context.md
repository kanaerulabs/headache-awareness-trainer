# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "Home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e10]: Home
      - link "Check-in" [ref=e11] [cursor=pointer]:
        - /url: /checkin
        - img [ref=e13]
        - generic [ref=e17]: Check-in
      - link [ref=e18] [cursor=pointer]:
        - /url: /log
        - img [ref=e20]
      - link "Insights" [ref=e22] [cursor=pointer]:
        - /url: /insights
        - img [ref=e24]
        - generic [ref=e26]: Insights
      - link "Learn" [ref=e27] [cursor=pointer]:
        - /url: /learn
        - img [ref=e29]
        - generic [ref=e31]: Learn
  - alert [ref=e32]: Headache Awareness Trainer
```