// src/pages/PrivacyPage.tsx

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        <p className="text-gray-400 mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Información que recopilamos</h2>
            <p className="text-gray-300">
              En Dazly, recopilamos la siguiente información cuando utilizas nuestros servicios:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Información de cuenta: email, nombre (cuando inicias sesión con Google)</li>
              <li>Proyectos y contenido que creas usando nuestra plataforma de IA</li>
              <li>Información de pago procesada de forma segura por Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Cómo usamos tu información</h2>
            <p className="text-gray-300">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Proporcionar y mejorar nuestros servicios de generación de imágenes con IA</li>
              <li>Gestionar tu cuenta y suscripción</li>
              <li>Procesar pagos de forma segura</li>
              <li>Comunicarnos contigo sobre actualizaciones del servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Compartir información</h2>
            <p className="text-gray-300">
              No compartimos tu información personal con terceros, excepto:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Con proveedores de servicios necesarios (Google Cloud, Stripe) para operar la plataforma</li>
              <li>Cuando sea requerido por ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Seguridad</h2>
            <p className="text-gray-300">
              Implementamos medidas de seguridad para proteger tu información, incluyendo
              encriptación de contraseñas y comunicaciones seguras HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Tus derechos</h2>
            <p className="text-gray-300">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Acceder a tu información personal</li>
              <li>Solicitar corrección o eliminación de tus datos</li>
              <li>Cancelar tu cuenta en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Contacto</h2>
            <p className="text-gray-300">
              Si tienes preguntas sobre esta política de privacidad, contáctanos en:
              <br />
              <a href="mailto:marcosdeaza007@gmail.com" className="text-primary hover:underline">
                marcosdeaza007@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
