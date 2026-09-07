# Play on Words

A responsive English ↔ Spanish vocabulary learning web application built with **Next.js, TypeScript, Supabase and PostgreSQL**.

Play on Words allows users to create their own personal vocabulary collection and practise it through interactive translation exercises.

The application was designed with a simple goal: make daily vocabulary practice fast, personal and easy to use from any device.

---

## Features

### Personal vocabulary

Users can create their own vocabulary database containing:

- English words
- One or multiple Spanish translations
- Multiple categories per word
- Persistent cloud storage

Vocabulary remains available between sessions and across different devices.

---

### Interactive practice

Two practice modes are available:

- 🇬🇧 English → Spanish
- 🇪🇸 Spanish → English

Users can practise:

- their complete vocabulary collection
- a specific category

Each session randomly shuffles the selected vocabulary and shows every word once.

---

### Automatic answer validation

Answers are checked automatically.

The validation system:

- ignores uppercase and lowercase differences
- ignores Spanish accents
- accepts multiple valid translations
- detects spelling mistakes

