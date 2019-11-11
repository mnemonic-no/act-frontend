import React from 'react';

import Page from '../Page';

const SearchPage = () => {
  const error = { error: null, onClose: () => {} };

  return (
    <Page errorSnackbar={error} isLoading={false}>
      <div>SEARCH PAGE</div>
    </Page>
  );
};

export default SearchPage;
