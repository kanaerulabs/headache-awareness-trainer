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
      - link "Insights" [ref=e24] [cursor=pointer]:
        - /url: /insights
        - img [ref=e26]
        - generic [ref=e31]: Insights
      - link "Learn" [ref=e32] [cursor=pointer]:
        - /url: /learn
        - img [ref=e34]
        - generic [ref=e37]: Learn
  - alert [ref=e38]: Headache Awareness Trainer
```