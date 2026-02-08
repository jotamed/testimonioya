# Plantillas de Email de Supabase Auth — TestimonioYa

Copiar estas plantillas en **Supabase Dashboard → Authentication → Email Templates**.

---

## 1. Confirm signup

**Subject:** `Confirma tu email — TestimonioYa`

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">TestimonioYa</h1>
  </div>
  <h2 style="color: #111827; font-size: 24px; text-align: center;">Confirma tu email ✉️</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
    ¡Gracias por registrarte en TestimonioYa! Confirma tu dirección de email para activar tu cuenta.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #4F46E5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Confirmar email
    </a>
  </div>
  <p style="color: #9ca3af; font-size: 13px; text-align: center;">
    Si no creaste esta cuenta, puedes ignorar este mensaje.
  </p>
  <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
    <p style="color: #d1d5db; font-size: 12px; margin: 0;">TestimonioYa — Testimonios que convierten</p>
  </div>
</div>
```

---

## 2. Reset password

**Subject:** `Recupera tu contraseña — TestimonioYa`

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">TestimonioYa</h1>
  </div>
  <h2 style="color: #111827; font-size: 24px; text-align: center;">Recupera tu contraseña 🔐</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
    Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #4F46E5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Restablecer contraseña
    </a>
  </div>
  <p style="color: #9ca3af; font-size: 13px; text-align: center;">
    Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña seguirá siendo la misma.
  </p>
  <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
    <p style="color: #d1d5db; font-size: 12px; margin: 0;">TestimonioYa — Testimonios que convierten</p>
  </div>
</div>
```

---

## 3. Magic link

**Subject:** `Tu enlace de acceso — TestimonioYa`

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">TestimonioYa</h1>
  </div>
  <h2 style="color: #111827; font-size: 24px; text-align: center;">Tu enlace de acceso 🔗</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
    Haz clic en el botón para acceder a tu cuenta de TestimonioYa. Este enlace es válido por 1 hora.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #4F46E5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Acceder a TestimonioYa
    </a>
  </div>
  <p style="color: #9ca3af; font-size: 13px; text-align: center;">
    Si no solicitaste este enlace, puedes ignorar este mensaje.
  </p>
  <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
    <p style="color: #d1d5db; font-size: 12px; margin: 0;">TestimonioYa — Testimonios que convierten</p>
  </div>
</div>
```

---

## 4. Change email address

**Subject:** `Confirma tu nuevo email — TestimonioYa`

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">TestimonioYa</h1>
  </div>
  <h2 style="color: #111827; font-size: 24px; text-align: center;">Confirma tu nuevo email ✉️</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
    Has solicitado cambiar tu dirección de email. Confirma haciendo clic en el botón.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #4F46E5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      Confirmar nuevo email
    </a>
  </div>
  <p style="color: #9ca3af; font-size: 13px; text-align: center;">
    Si no solicitaste este cambio, contacta con soporte inmediatamente.
  </p>
  <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 24px; text-align: center;">
    <p style="color: #d1d5db; font-size: 12px; margin: 0;">TestimonioYa — Testimonios que convierten</p>
  </div>
</div>
```

---

## Instrucciones

1. Ve a **Supabase Dashboard** → tu proyecto → **Authentication** → **Email Templates**
2. Para cada tipo de email, copia el **Subject** y el **HTML** correspondiente
3. Guarda los cambios

> **Nota:** Las variables `{{ .ConfirmationURL }}` son de Supabase y se reemplazan automáticamente.
