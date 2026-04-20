const StatCard = ({ icon: Icon, label, value, variant = '', onClick }) => {
    return (
        <div className={`stat-card glass ${variant}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
            {Icon && (
                <div className="icon-circle">
                    <Icon size={22} />
                </div>
            )}
            <div className="stat-info">
                <span className="label">{label}</span>
                <span className="value">{value}</span>
            </div>
        </div>
    );
};

export default StatCard;
