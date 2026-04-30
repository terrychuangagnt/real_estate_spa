# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.js >> 搜尋頁面 >> should search and display results when selecting city and district
- Location: tests/e2e/search.spec.js:43:3

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('text=請選擇縣市')

```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```