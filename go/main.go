package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	sanwo "github.com/Sanwohq/go"
)

func main() {
	provider := envOr("SANWO_PROVIDER", "paystack")
	publicKey := envOr("SANWO_PUBLIC_KEY", "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1")
	currency := envOr("SANWO_CURRENCY", "NGN")

	s, err := sanwo.New(sanwo.Config{
		Provider:  provider,
		PublicKey: publicKey,
		Currency:  currency,
		Debug:     true,
	})
	if err != nil {
		log.Fatal(err)
	}

	tmpl := template.Must(template.ParseFiles("templates/sanwo.html"))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Scripts":            s.RenderScript(),
			"PublicKey":          publicKey,
			"FlutterwaveKey":     envOr("FLUTTERWAVE_PUBLIC_KEY", "FLWPUBK_TEST-9b27878d10450bee730880c3064dce82-X"),
			"MonnifyKey":         envOr("MONNIFY_API_KEY", "MK_TEST_NXM9TBLPUE"),
			"MonnifyContract":    envOr("MONNIFY_CONTRACT_CODE", "2403120008"),
			"InterswitchMerchant": envOr("INTERSWITCH_MERCHANT_CODE", "MX007"),
			"InterswitchPayItem": envOr("INTERSWITCH_PAY_ITEM_ID", "101007"),
		}
		if err := tmpl.Execute(w, data); err != nil {
			http.Error(w, err.Error(), 500)
		}
	})

	port := envOr("PORT", "8080")
	fmt.Printf("Sanwo Go example running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
