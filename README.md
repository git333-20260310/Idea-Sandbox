# Idea-Sandbox

This repository is a personal sandbox for starting unrelated app or tool ideas from an iPhone with Codex Cloud.

The user is not a programmer. When the user asks for something here, assume they want Codex to choose a simple implementation path, create the files, and explain only the minimum steps needed to run or review it.

## Most Important Habit

When the user starts a new idea from iPhone, they should name a folder under `ideas/` in the request.

Use this pattern:

```text
ideas/<idea-name> に <作りたいもの> を作って
```

Examples:

```text
ideas/weight-meal-tracker に体重と食事管理アプリを作って
ideas/english-flashcards に英単語暗記アプリを作って
ideas/simple-invoice に簡単な請求書作成ツールを作って
```

## How To Work In This Repository

- Put each unrelated idea in its own folder under `ideas/`.
- Use a clear folder name such as `ideas/weight-meal-tracker`.
- Do not mix separate ideas in the same folder.
- Prefer a working, simple prototype over architecture.
- If the user does not specify a stack, choose the simplest practical option.
- For small mobile-friendly app prototypes, plain HTML/CSS/JavaScript with localStorage is usually enough.
- If a framework is useful, choose a lightweight Vite app.
- Avoid adding servers, databases, accounts, paid services, or complex deployment unless the user clearly asks.
- Each idea folder should include its own `README.md` with:
  - what was built
  - how to run it
  - how to check it on iPhone or in a browser
  - what could be added next

## Example User Request

```text
Create a small weight and meal tracking app in ideas/weight-meal-tracker.
Make it easy to use on iPhone.
It should save date, weight, breakfast, lunch, dinner, and notes.
Local browser storage is enough for the first version.
```

## Expected Codex Behavior

When working on a new idea:

1. Create the idea folder.
2. Build a minimal usable prototype.
3. Keep the files self-contained when possible.
4. Add a short README inside the idea folder.
5. Commit the change with a clear message.
