const toolbox = document.getElementById('toolbox');

async function showCategories() {
  const categories = await loadCategories();
  const list = createElement('ul', 'toolbox-list');

  categories.forEach((category) => {
    const button = createElement('button', 'toolbox-category');
    button.type = 'button';
    button.append(createElement('strong', '', category.Nev), createElement('span', '', category.Leiras));
    button.addEventListener('click', () => showProducts(category));

    const item = createElement('li');
    item.append(button);
    list.append(item);
  });

  toolbox.replaceChildren(list);
}

async function showProducts(category) {
  const products = await loadProducts(category.ID);

  const back = createElement('button', 'toolbox-back', '← Vissza');
  back.type = 'button';
  back.addEventListener('click', showCategories);

  const header = createElement('div', 'toolbox-header');
  header.append(back, createElement('h3', 'toolbox-heading', category.Nev));

  const list = createElement('ul', 'toolbox-list');

  products.forEach((product) => {
    const meta = createElement('span', 'toolbox-meta');
    meta.append(createElement('span', '', product.Meret_Adatok), createElement('span', 'toolbox-price', formatPrice(product.Ar)));

    const text = createElement('div', 'toolbox-product-text');
    text.append(createElement('strong', '', product.Nev), meta);

    const item = createElement('li', 'toolbox-product');
    item.dataset.id = product.ID;
    item.title = product.Leiras;
    item.append(createProductIcon(product.Kategoria_ID), text);
    item.addEventListener('pointerdown', (e) => startProductDrag(e, product));
    list.append(item);
  });

  const hint = createElement('p', 'toolbox-hint', 'Húzd a terméket a tervezőre (érintőképernyőn koppints rá).');

  toolbox.replaceChildren(header, hint, list);
}

showCategories();
