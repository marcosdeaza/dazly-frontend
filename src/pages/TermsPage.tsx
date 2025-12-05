// src/pages/TermsPage.tsx

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>
        <p className="text-gray-400 mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los términos</h2>
            <p className="text-gray-300">
              Al acceder y usar Dazly, aceptas estar sujeto a estos Términos de Servicio
              y a todas las leyes y regulaciones aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Descripción del servicio</h2>
            <p className="text-gray-300">
              Dazly es una plataforma de generación de imágenes mediante inteligencia artificial.
              Ofrecemos diferentes planes de suscripción con créditos mensuales para generar contenido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Uso aceptable</h2>
            <p className="text-gray-300">
              Al usar Dazly, te comprometes a:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>No generar contenido ilegal, ofensivo o que viole derechos de terceros</li>
              <li>No intentar violar la seguridad de la plataforma</li>
              <li>No revender o redistribuir el acceso a Dazly sin autorización</li>
              <li>Cumplir con todas las leyes aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Propiedad intelectual</h2>
            <p className="text-gray-300">
              Las imágenes que generes con Dazly son de tu propiedad. Sin embargo, Dazly
              retiene todos los derechos sobre la plataforma, software y tecnología subyacente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Pagos y suscripciones</h2>
            <p className="text-gray-300">
              Las suscripciones se renuevan automáticamente cada mes. Puedes cancelar en cualquier
              momento desde tu cuenta. Los pagos son procesados de forma segura por Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Limitación de responsabilidad</h2>
            <p className="text-gray-300">
              Dazly se proporciona "tal cual". No garantizamos que el servicio esté libre de errores
              o interrupciones. No somos responsables de pérdidas derivadas del uso de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Modificaciones</h2>
            <p className="text-gray-300">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios se publicarán en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contacto</h2>
            <p className="text-gray-300">
              Para preguntas sobre estos términos, contáctanos en:
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

export default TermsPage;
