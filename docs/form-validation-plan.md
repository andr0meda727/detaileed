# Globalna Walidacja Formularzy - Plan Wdrożenia (Zaktualizowany)

Celem tego zadania jest ujednolicenie i wdrożenie solidnego systemu walidacji danych wejściowych we wszystkich formularzach w aplikacji. Zamiast duplikować kod walidacji w każdym widoku, użyjemy sprawdzonych rozwiązań.

## Analiza Stanu Obecnego

Obecnie aplikacja posiada wiele zduplikowanych formularzy (np. dodawanie klienta, tworzenie rezerwacji), które rozsiane są w `Dashboard`, `ClientsView`, `ReportsView` czy `TasksView`. Walidacja opiera się na prostych instrukcjach `if` wywołujących notyfikacje typu `addToast`. Powoduje to chaos informacyjny, brak ujednoliconych reguł dla pól m.in. jak NIP czy e-mail oraz trudności w utrzymaniu tak rozproszonego kodu.

## Proponowane Zmiany (Rekomendowany Stack: Zod + React Hook Form)

Wykorzystanie zewnętrznych bibliotek (szczególnie w standardzie `zod` + `react-hook-form`) pozwoli uniknąć odkrywania koła na nowo. Dla aplikacji SaaS, która z czasem będzie wymagała bardziej złożonych formularzy (np. dodawanie wielu pojazdów na raz, dynamiczne usługi, skomplikowane relacje), to podejście gwarantuje brak problemów wydajnościowych z renderowaniem, bezpieczne typowanie (TypeScript) oraz znacznie czystszy kod.

### 1. Instalacja Zależności

Zainstalowanie bibliotek niezbędnych do obsługi schematów i kontrolowania rzadszych renderów:

```bash
npm install react-hook-form zod @hookform/resolvers
```

### 2. Moduł Schematów Walidacji (`utils/validations/`)

Stworzenie scentralizowanych schematów (Zod Schemas) do ponownego wykorzystania:

- Wzorzec walidacji telefonu (musi być wypełniony i mieć poprawny format).
- Wzorzec NIP.
- Modele do formularzy z bazy DTO: `ClientFormSchema`, `BookingFormSchema`, `VehicleFormSchema`.

### 3. Centralizacja Modali Formularzy

Utworzenie reużywalnych komponentów w katalogu `components/modals/`, obsługujących nową walidację i współpracujących z TanStack Query:

#### [NEW] `components/modals/CreateClientModal.tsx`

Będzie korzystał z `useForm({ resolver: zodResolver(ClientFormSchema) })`. Zapewni on estetyczne **komunikaty pod danym polem** w przypadku braku danych (np. wymagany telefon), bez polegania jedynie na `addToast`.

#### [NEW] `components/modals/CreateBookingModal.tsx`

Skomplikowany formularz rezerwacyjny zostanie podpięty pod schemat wymuszający np. poprawne kwoty czy relacje do klienta/pojazdu. Wszelkie błędy złapią się po cichu i pokażą w UI w intuicyjny sposób.

### 4. Wdrożenie Nowych Formularzy w Widokach

Usunięcie ze wszystkich starych widoków (`Dashboard.tsx`, `ClientsView.tsx`, `InventoryView.tsx`, `TasksView.tsx`, `ReportsView.tsx`, `TeamView.tsx`) setek linijek zduplikowanego kodu odpowiadającego za formularze i zastąpienie ich pojedynczymi wywołaniami scentralizowanych modali (np. po prostu `<CreateClientModal isOpen={...} onClose={...} />`).

### 5. Walidacja Ustawień i Autoryzacji

#### [MODIFY] `views/settings/StudioSettingsView.tsx` (dane studia m.in. NIP)

#### [MODIFY] `views/settings/UserSettingsView.tsx` (zmiana hasła — dodana walidacja identyczności haseł przez Zod: `refine()`)

#### [MODIFY] `views/auth/LoginView.tsx` i `SetPasswordView.tsx`

> [!IMPORTANT]
> **Zarządzanie Błędami UX**
> W przypadku błędów odrzucamy użycie natrętnych `addToast`, jeżeli błąd dotyczy konkretnego pola formularza (np. "To pole jest wymagane"). Zamiast tego pojawią się subtelne czerwone podpisy prosto pod błędnie wypełnionym Inputem. `addToast` zachowamy wyłącznie jako komunikację po stronie połącznia z backendem lub ogólne "Sukces" czy błędy rzędu 500 API.

## Plan Weryfikacji

### Weryfikacja Manualna

1. Otwarcie formularza "Nowy Klient".
2. Próba przesłania pustego formularza – błędy interfejsu (Inline UI) nie zezwalają na zamknięcie okna ani stworzenie zbędnych zapytań o ile nie spełniono schematu `Zod`.
3. Testy wyrażeń dla kluczowych pól typu NIP czy numery telefonów.
4. Upewnienie się, że wszystkie usunięte na rzecz nowych modali widoki poprawnie je wywołują i zachowuj spójność danych.
