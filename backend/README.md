# Teacher Panel Backend — USERINFO / CHECKINOUT

This version uses the uploaded `att2000.mdb` database.

## Database mapping

### USERINFO
Teacher/faculty details are read from `USERINFO`.

The backend detects the available useful columns and maps:
- USERID / UserId → faculty ID used by attendance
- Badgenumber → faculty login ID
- Name → faculty name
- Gender → faculty gender
- PASSWORD → password when present

It does not depend on the old `Teachers` table.

### CHECKINOUT
Only these two fields are used:
- `USERID`
- `CHECKTIME`

For each teacher and calendar date:
- earliest `CHECKTIME` = Check In
- latest `CHECKTIME` = Check Out

The backend intentionally does NOT use:
- CHECKTYPE
- VERIFYCODE
- SENSORID
- WorkCode
- sn
- any other biometric-device fields

Saturday is a working day. Sunday is the weekly holiday.

## Run

1. Install the Microsoft Access ODBC driver on the Windows machine.
2. Confirm `.env` points to `./src/data/att2000.mdb`.
3. Install dependencies:
   `npm install`
4. Start:
   `npm start`

The API listens on port 4000 by default.

## Production

For a remote Windows server, keep `att2000.mdb` on that server beside the backend and run the Node process with PM2. Set `CORS_ORIGIN` to the actual frontend URL.

## Attendance punch fix

This build reads only `USERID` and `CHECKTIME` from `CHECKINOUT`.
For each teacher and calendar date it aggregates all punches as:

- `inMin` = first (earliest) punch
- `outMin` = last (latest) punch

The Access date/time parser handles JavaScript `Date` values and common Access/ODBC date-time string formats. The store now explicitly imports the date/time parsing helpers used by the biometric attendance aggregation.

Saturday remains a working day; Sunday is the weekly holiday.


### Faculty creation
The admin API creates faculty using only:
- `name` → `USERINFO.Name`
- `id` → `USERINFO.USERID` and `USERINFO.Badgenumber`
- `gender` → `USERINFO.Gender`

The admin/co-admin toggle endpoint has been removed.