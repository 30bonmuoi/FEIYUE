window.dataSdk = {
  _data: [],
  _handlers: [],
  _apiBase: '',
  _type: 'attendance',
  
  async init(handler) {
    this._handlers.push(handler);
    const currentPath = window.location.pathname;
    this._type = currentPath.includes('revenue') ? 'revenue' : 'attendance';
    await this._fetchData();
    return { isOk: true };
  },
  
  async _fetchData() {
    try {
      const response = await fetch(`/api/${this._type}`);
      const result = await response.json();
      if (result.isOk) {
        this._data = result.data || [];
        this._notifyHandlers();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
  
  _notifyHandlers() {
    this._handlers.forEach(handler => {
      if (handler.onDataChanged) {
        handler.onDataChanged([...this._data]);
      }
    });
  },
  
  async create(record) {
    try {
      const response = await fetch(`/api/${this._type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const result = await response.json();
      if (result.isOk) {
        await this._fetchData();
      }
      return result;
    } catch (error) {
      console.error('Error creating record:', error);
      return { isOk: false, error: error.message };
    }
  },
  
  async delete(record) {
    try {
      const id = record.id || record;
      const response = await fetch(`/api/${this._type}/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.isOk) {
        await this._fetchData();
      }
      return result;
    } catch (error) {
      console.error('Error deleting record:', error);
      return { isOk: false, error: error.message };
    }
  },
  
  async deleteAll() {
    try {
      const response = await fetch(`/api/${this._type}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.isOk) {
        await this._fetchData();
      }
      return result;
    } catch (error) {
      console.error('Error deleting all records:', error);
      return { isOk: false, error: error.message };
    }
  },
  
  async deleteByUserId(userId) {
    try {
      const response = await fetch(`/api/attendance/user/${userId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.isOk) {
        await this._fetchData();
      }
      return result;
    } catch (error) {
      console.error('Error deleting user records:', error);
      return { isOk: false, error: error.message };
    }
  }
};
