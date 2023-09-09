# Generate secerts

The following command generates a secert value that is base64 encoded then
piped into sed to encoded it to make it compatable with urls.

```
openssl rand -base64 172 | sed 's/+/-/g' | sed 's/\//\_/g'
```

https://stackoverflow.com/questions/55389211/string-based-data-encoding-base64-vs-base64url
