# Photo as a Service

### Választott környezet

Az alkalmazás Azure-on fut, külön App Service resourceokkal:

- frontend: Next.js alkalmazás
- backend: ASP.NET Core Web API
- adatbázis: Azure Database for PostgreSQL Flexible Servers

A deployment GitHub Actions workflow-kon keresztül történik. Az App Service-ek (frontend, backend) létrehozásakor kapott template-eket módosítottam úgy, hogy csak az adott folderre vonatkozó változtatásokkor fussanak le.

### Rétegek

1. Prezentációs réteg

- Next.js kliens.
- A felhasználó innen éri el a be/kijelentkezést, regisztráció, lista nézetet, feltöltést és törlést.

1. Alkalmazási réteg

- ASP.NET Core API végpontok.
- Itt történik az autentikáció (.NET Identity) és a képek CRUD műveletei.

1. Adatréteg (PostgreSQL)

- Identity táblák és Photos tábla.
- EF Core migrációk kezelik a séma létrehozását/frissítését.

### Kapcsolatok a rétegek között

- A frontend HTTP hívásokkal éri el a backend API-t.
- A backend EF Core segítségével kapcsolódik a PostgreSQL adatbázishoz.
- A frontend és backend kapcsolatához Azureban megadott környezeti változók adják az engedélyezett origint a backendnek, és a backend címét a frontendnek. Illetve a DB connection stringjét is a backend számára.

### Megjegyzés

Jelenleg a fotó fájlok lokálisan tárolódnak a backend oldalon. Nem tudtam hogy a Blob Storage használata ehhez a lépéshez tartozik-e.
