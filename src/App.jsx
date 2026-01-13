import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap'

const apiBase = 'https://ec-course-api.hexschool.io/v2';
const apiPath = 'wind-api';

function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState({
    id: '',
    title: '',
    category: '',
    origin_price: '',
    price: '',
    unit: '',
    description: '',
    content: '',
    is_enabled: '',
    imageUrl: '',
    imagesUrl: []
  });

  const [type, setType] = useState('');
  const productModalRef = useRef(null);

  useEffect(() => {
    productModalRef.current = new Modal(productModalRef.current, {
      keyboard: false,
    });

    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      axios.defaults.headers.common.Authorization = token;
      checkLogin();
    }
  }, []);

  const openModal = (product, type) => {
    setTempProduct({
      id: product.id || '',
      title: product.title || '',
      category: product.category || '',
      origin_price: product.origin_price || '',
      price: product.price || '',
      unit: product.unit || '',
      description: product.description || '',
      content: product.content || '',
      is_enabled: product.is_enabled || '',
      imageUrl: product.imageUrl || '',
      imagesUrl: product.imagesUrl || []
    });
    setType(type);
    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  }

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiBase}/admin/signin`, formData);
      const { expired, token } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;
      setIsAuth(true);
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  const checkLogin = async () => {
    try {
      await axios.post(`${apiBase}/api/user/check`);
      setIsAuth(true);
      getProducts();
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/${apiPath}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(`取得產品失敗：${error.response.data.message}`);
    }
  }

  const updateProduct = async (id) => {
    // 新增產品
    let url = `${apiBase}/api/${apiPath}/admin/product`;
    let method = 'post';
    let text = '新增';

    // 編輯產品
    if (id) {
      url = `${apiBase}/api/${apiPath}/admin/product/${id}`;
      method = 'put';
      text = '編輯';
    }

    const product = {
      data: {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0
      }
    }

    try {
      await axios[method](url, product);
      closeModal();
      getProducts();
    } catch (error) {
      console.log(`${text}失敗：${error.response.data.message}`);
    }
  }

  const removeProduct = async (id) => {
    try {
      await axios.delete(`${apiBase}/api/${apiPath}/admin/product/${id}`);
      closeModal();
      getProducts();
    } catch (error) {
      onsole.log(`刪除失敗：${error.response.data.message}`);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    })
  }

  const handleAddImage = () => {
    setTempProduct(() => ({
      ...tempProduct,
      imagesUrl: [...tempProduct.imagesUrl, '']
    }));
  }

  const handleRemoveImage = () => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.pop();
    setTempProduct(() => ({
      ...tempProduct,
      imagesUrl: newImages
    }));
  }

  return (
    <>
      {isAuth ? (
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button className="btn btn-primary" onClick={() => {
                openModal({}, 'add');
              }}>建立新的產品</button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                  <tr key={ product.id }>
                    <td>{ product.category }</td>
                    <td>{ product.title }</td>
                    <td className="text-end">{ product.origin_price }</td>
                    <td className="text-end">{ product.price }</td>
                    <td>{ product.is_enabled ? <span className="text-success">啟用</span> : <span>未啟用</span> }
                    </td>
                    <td>
                      <div className="btn-group">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => {
                          openModal(product, 'edit');
                        }}>
                          編輯
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => {
                          openModal(product, 'remove');
                        }}>
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={login}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="username"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                  >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2026~∞ - 六角學院</p>
        </div>
      )}
      <div
        ref={productModalRef}
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  { type === 'edit' ? '編輯' : type === 'remove' ? '刪除' : '新增' }產品
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        name="imageUrl"
                        id="imageUrl"
                        type="text"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={ tempProduct.imageUrl }
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <img className="img-fluid" src={ tempProduct.imageUrl || '#' } alt="主圖" />
                  </div>
                  {tempProduct.imagesUrl.length > 0 && (
                    tempProduct.imagesUrl.map((image, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder={`圖片網址 ${index + 1}`}
                          value={image}
                          onChange={(e) => {
                            handleImageChange(e, index)
                          }}
                        />
                        {image && (
                          <img className="img-preview mb-2" src={image} alt={`副圖 ${index + 1}`} />
                        )}
                      </div>
                  )))}
                  <div className="d-flex justify-content-between">
                    {tempProduct.imagesUrl.length < 5 &&
                      tempProduct.imagesUrl[
                        tempProduct.imagesUrl.length - 1
                      ] !== "" && (
                        <button
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={handleAddImage}
                        >
                          新增圖片
                        </button>
                    )}

                    {tempProduct.imagesUrl.length >= 1 && (
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={handleRemoveImage}
                      >
                        取消圖片
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={ tempProduct.title }
                      onChange={handleModalInputChange}
                      />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類</label>
                      <input
                        name="category"
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={ tempProduct.category }
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位</label>
                      <input
                        name="unit"
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={ tempProduct.unit }
                        onChange={handleModalInputChange}
                        />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={ tempProduct.origin_price }
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input
                        name="price"
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={ tempProduct.price }
                        onChange={handleModalInputChange}
                        />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={ tempProduct.description }
                      onChange={handleModalInputChange}
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={ tempProduct.content }
                      onChange={handleModalInputChange}
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={ tempProduct.is_enabled }
                        onChange={handleModalInputChange}
                        />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                >
                取消
              </button>
              {
                type === 'remove' ? (
                  <button type="button" className="btn btn-danger" onClick={() => {
                    removeProduct(tempProduct.id);
                  }}>刪除</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => {
                    updateProduct(tempProduct.id);
                  }}>確認</button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
