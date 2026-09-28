"""Partitioned observation files and a DuckDB read."""

from training_continuity.generation.materialize import materialize


def test_materialize_resumes_and_is_queryable(tmp_path):
    import duckdb

    first = materialize(tmp_path, [1])
    assert first["partitions"] == ["part-0001.parquet"]
    second = materialize(tmp_path, [1, 2])
    assert second["partitions"] == ["part-0001.parquet", "part-0002.parquet"]
    count = duckdb.sql(f"select count(*) from read_parquet('{(tmp_path / 'part-0001.parquet').as_posix()}')").fetchone()
    assert count[0] > 0
