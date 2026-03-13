import Header from '../../src/components/header/Header';
import Navigate from '../../src/components/navigate/Navigate';
import Card from '../../src/components/card/Card';
import Footer from '../../src/components/footer/Footer';
import ChatbotWidget from '../../src/components/chatbot/ChatbotWidget';

export default function Homepage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <Header />

      {/* Banner/Navigate Slider */}
      <Navigate />

      {/* Featured/Collaboration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Collaboration
            </h2>
            <p className="text-lg text-gray-600">
              Discover our exclusive collections with world-renowned artists
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <Card />
      </section>

      {/* Newsletter Section */}
      {/* <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            Get the latest updates on new collections and exclusive offers
          </p>

          <form className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-400 text-sm">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section> */}

      {/* Categories Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Shop By Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative h-64 rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-amber-400 to-amber-600">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">T-Shirts</h3>
                  <p className="text-white/80 group-hover:text-white transition-colors">
                    Shop Collection
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative h-64 rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-red-400 to-red-600">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">Hoodies</h3>
                  <p className="text-white/80 group-hover:text-white transition-colors">
                    Shop Collection
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative h-64 rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-blue-400 to-blue-600">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">Accessories</h3>
                  <p className="text-white/80 group-hover:text-white transition-colors">
                    Shop Collection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Promotional Banner */}
      {/* <section className="py-12 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Summer Sale
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Get up to 50% off on selected items. Limited time offer!
              </p>
              <button className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                Shop Sale
              </button>
            </div>
            <div className="flex-1 text-right">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-2">
                50%
              </div>
              <p className="text-xl text-gray-300">OFF</p>
            </div>
          </div>
        </div>
      </section> */}

      {/*{/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600">
                On orders over $50. Fast and reliable delivery to your doorstep.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                100% Authentic
              </h3>
              <p className="text-gray-600">
                All products are guaranteed to be 100% authentic and original.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-gray-600">
                30-day return policy. Shop with confidence knowing you can return anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <ChatbotWidget />
    </div>
  );
}
