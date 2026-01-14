# Knowledge Alert: RevenueCat P8 Key Mismatch

When configuring RevenueCat for the App Factory fleet, there is a critical distinction between the two types of P8 keys in App Store Connect.

### ⚠️ The Gotcha: "Wrong File" Error
If RevenueCat rejects your P8 file, it's likely because you downloaded the **App Store Connect API** key instead of the **In-App Purchase** key.

| Key Type | Role | Filename Prefix | Purpose |
| :--- | :--- | :--- | :--- |
| **App Store Connect API** | App Manager | `AuthKey_...` | Importing products/prices. |
| **In-App Purchase** | (N/A) | `SubscriptionKey_...` | **Processing Transactions (Required for StoreKit 2).** |

### 🛠️ The Fix:
1.  In App Store Connect, go to **Users and Access** -> **Integrations**.
2.  Select the **In-App Purchase** tab (not the default "App Store Connect API" tab).
3.  Generate and download the key here. The file will start with `SubscriptionKey_`.
4.  This specific file is what must be uploaded to the RevenueCat "In-app purchase key configuration" section.
