const EmptyState = ({ icon: Icon, title, subtitle, action }) => {
    return (
        <div className="empty-state">
            {Icon && (
                <div className="empty-state-icon">
                    <Icon size={48} strokeWidth={1.5} />
                </div>
            )}
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
            {action && (
                <div className="empty-state-action">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
