sqlcmd -S $(SQL_SERVER) -U $(SQL_USER) -P $(SQL_PASSWORD) -d $1 -i purge-pins.sql -I