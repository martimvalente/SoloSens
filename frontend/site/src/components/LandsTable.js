import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandsTable = ({ lands, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="table-responsive mt-4">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lands.map(land => (
            <tr key={land.id}>
              <td>{land.name}</td>
              <td>{land.description}</td>
              <td>{land.latitude}</td>
              <td>{land.longitude}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-info me-2"
                  onClick={() => navigate(`/lands/${land.id}`)}
                >
                  View
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(land.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandsTable;
