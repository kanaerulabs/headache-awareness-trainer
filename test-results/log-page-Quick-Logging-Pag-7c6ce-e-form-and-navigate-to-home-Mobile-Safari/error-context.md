# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "Home" [ref=e5]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e10]: Home
      - link "Check-in" [ref=e11]:
        - /url: /checkin
        - img [ref=e13]
        - generic [ref=e17]: Check-in
      - link [ref=e18]:
        - /url: /log
        - img [ref=e20]
      - link "Insights" [ref=e22]:
        - /url: /insights
        - img [ref=e24]
        - generic [ref=e26]: Insights
      - link "Learn" [ref=e27]:
        - /url: /learn
        - img [ref=e29]
        - generic [ref=e31]: Learn
  - alert [ref=e32]: Headache Awareness Trainer
  - dialog "Install Headache Trainer" [ref=e33]:
    - generic [ref=e34]:
      - button "Dismiss install prompt" [ref=e35] [cursor=pointer]:
        - img [ref=e36]
      - generic [ref=e39]:
        - img [ref=e41]
        - generic [ref=e43]:
          - heading "Install Headache Trainer" [level=3] [ref=e44]
          - paragraph [ref=e45]: Tap the share button and select 'Add to Home Screen' for the best experience
          - generic [ref=e46]:
            - img [ref=e48]
            - generic [ref=e50]: Tap share, then "Add to Home Screen"
```