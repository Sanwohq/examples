import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideSanwo } from '@sanwohq/angular';
import { paystackProvider } from '@sanwohq/paystack';

bootstrapApplication(AppComponent, {
  providers: [
    provideSanwo({
      provider: paystackProvider,
      publicKey: 'pk_test_xxxxxxxxxxxx',
      containerId: 'sanwo-container',
    }),
  ],
}).catch((err) => console.error(err));
