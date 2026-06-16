import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";
import LoginSignup from "./Pages/LoginSignup";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import OrderSuccess from "./Pages/OrderSuccess";
import AnimatedBackground from "./Components/AnimatedBackground/AnimatedBackground";
import InteractiveParticleCanvas from "./Components/InteractiveParticleCanvas/InteractiveParticleCanvas";

export const backend_url = 'http://localhost:4000';
export const currency = '$';

/*
 * AppShell is rendered inside <Router> so that InteractiveParticleCanvas
 * can safely call useLocation() to adjust particle density per route.
 *
 * Layer order (back → front):
 *   z-index: -20  InteractiveParticleCanvas  ← canvas particle field
 *   z-index: -10  AnimatedBackground          ← gradient mesh + bubbles + shapes
 *   z-index:  0+  page content
 *   z-index: 100+ Navbar / dropdowns / modals
 */
const AppShell = () => (
  <>
    <InteractiveParticleCanvas />
    <AnimatedBackground />
    <Navbar />
    <Routes>
      <Route path="/"            element={<Shop gender="all" />} />
      <Route path="/mens"        element={<ShopCategory banner={men_banner}    category="men"   />} />
      <Route path="/womens"      element={<ShopCategory banner={women_banner}  category="women" />} />
      <Route path="/kids"        element={<ShopCategory banner={kid_banner}    category="kid"   />} />
      <Route path="/product"     element={<Product />}>
        <Route path=":productId" element={<Product />} />
      </Route>
      <Route path="/cart"          element={<Cart />} />
      <Route path="/checkout"      element={<Checkout />} />
      <Route path="/orders"        element={<Orders />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/login"         element={<LoginSignup />} />
    </Routes>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
